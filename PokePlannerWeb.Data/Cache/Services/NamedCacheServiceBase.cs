using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing a collection of named PokeAPI resources in the cache.
    /// </summary>
    public class NamedCacheServiceBase<TResource> : CacheServiceBase<TResource> where TResource : NamedApiResource
    {
        /// <summary>
        /// The cache source.
        /// </summary>
        protected new INamedCacheSource<TResource> CacheSource => base.CacheSource as INamedCacheSource<TResource>;

        /// <summary>
        /// Connect to cache and initialise logger.
        /// </summary>
        public NamedCacheServiceBase(
            INamedCacheSource<TResource> cacheSource,
            IPokeAPI pokeApi,
            ILogger<NamedCacheServiceBase<TResource>> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region Public methods

        /// <summary>
        /// Returns the resource with the given ID, creating a cache entry if it doesn't exist.
        /// </summary>
        public override async Task<TResource> Upsert(UrlNavigation<TResource> res)
        {
            var namedRes = res as NamedApiResource<TResource>;

            var name = namedRes.Name;
            var entry = await CacheSource.GetCacheEntry(name);
            if (entry == null)
            {
                var entryType = typeof(TResource).Name;
                Logger.LogInformation($"Caching {entryType} with name {name}...");

                var resource = await PokeApi.Get(res);
                return await Create(resource);
            }
            else if (IsStale(entry))
            {
                // update cache entry if it's stale
                var entryType = typeof(TResource).Name;
                Logger.LogInformation($"Cached {entryType} with name {name} is stale - updating...");

                var resource = await PokeApi.Get(res);
                await Update(resource);
                return resource;
            }

            return entry.Resource;
        }

        #endregion
    }
}
