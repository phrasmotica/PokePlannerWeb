using Microsoft.Extensions.Caching.Memory;
using PokeApiNet.Models;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Manages caches for various classes.
    /// Adapted from https://github.com/mtrdp642/PokeApiNet/blob/master/PokeApiNet/Cache/ResourceCacheManager.cs.
    /// </summary>
    internal sealed class CacheManager : BaseCacheManager, IDisposable
    {
        /// <summary>
        /// Set of types supported by this cache manager.
        /// </summary>
        protected override ImmutableHashSet<System.Type> SupportedTypes => new HashSet<System.Type>
        {
            typeof(IEnumerable<LocationAreaEncounter>)
        }.ToImmutableHashSet();

        /// <summary>
        /// Map of supported types to their caches.
        /// </summary>
        private IImmutableDictionary<System.Type, Cache> caches;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CacheManager()
        {
            caches = SupportedTypes.ToImmutableDictionary(x => x, _ => new Cache());
        }

        /// <summary>
        /// Caches a value.
        /// </summary>
        public void Store<T>(string key, T obj) where T : class
        {
            var objectType = typeof(T);
            if (!IsTypeSupported(objectType))
            {
                throw new NotSupportedException($"{objectType.FullName} is not supported.");
            }

            caches[objectType].Store(key, obj);
        }

        /// <summary>
        /// Gets a value from the cache by key.
        /// </summary>
        public T Get<T>(string key) where T : class
        {
            var resourceType = typeof(T);
            return caches[resourceType].Get(key) as T;
        }

        /// <summary>
        /// Clears all caches.
        /// </summary>
        public void ClearAll()
        {
            foreach (var cache in caches.Values)
            {
                cache.Clear();
            }
        }

        /// <summary>
        /// Clears a specific cache.
        /// </summary>
        public void Clear<T>()
        {
            var type = typeof(T);
            caches[type].Clear();
        }

        /// <summary>
        /// Disposes of this cache manager.
        /// </summary>
        public void Dispose()
        {
            foreach (var cache in caches.Values)
            {
                cache.Dispose();
            }

            caches = null;
        }

        /// <summary>
        /// Wrapper class for writing to and reading from a MemoryCache.
        /// </summary>
        private sealed class Cache : BaseExpirableCache, IDisposable
        {
            /// <summary>
            /// The cache.
            /// </summary>
            private readonly MemoryCache ObjectCache;

            /// <summary>
            /// Constructor.
            /// </summary>
            public Cache()
            {
                ObjectCache = new MemoryCache(new MemoryCacheOptions());
            }

            /// <summary>
            /// Returns the object with the given key.
            /// </summary>
            public object Get(string key)
            {
                return ObjectCache.Get(key);
            }

            /// <summary>
            /// Stores the object under the given key.
            /// </summary>
            public void Store(string key, object obj)
            {
                ObjectCache.Set(key, obj, CacheEntryOptions);
            }

            /// <summary>
            /// Clears all cached objects.
            /// </summary>
            public void Clear()
            {
                ExpireAll();
            }

            /// <summary>
            /// Disposes the cache.
            /// </summary>
            public void Dispose()
            {
                ExpireAll();
                ObjectCache.Dispose();
            }
        }
    }
}