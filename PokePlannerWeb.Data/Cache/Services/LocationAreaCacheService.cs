using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of location area resources in the cache.
    /// </summary>
    public class LocationAreaCacheService : CacheServiceBase<LocationArea>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationAreaCacheService(
            ICacheSource<LocationArea> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<LocationArea>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
