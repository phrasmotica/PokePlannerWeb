using System;
using System.Collections.Immutable;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Base class for a cache manager implementation.
    /// Adapted from https://github.com/mtrdp642/PokeApiNet/blob/master/PokeApiNet/Cache/BaseCacheManager.cs.
    /// </summary>
    internal abstract class BaseCacheManager
    {
        /// <summary>
        /// Set of types supported by this cache manager.
        /// </summary>
        protected abstract ImmutableHashSet<Type> SupportedTypes { get; }

        /// <summary>
        /// Returns whether the given type is supported by this cache manager.
        /// </summary>
        protected bool IsTypeSupported(Type type) => SupportedTypes.Contains(type);
    }
}
