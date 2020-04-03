using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of location resources in the cache.
    /// </summary>
    public class LocationCacheService : CacheServiceBase<Location>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationCacheService(
            ICacheSource<Location> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Location>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
