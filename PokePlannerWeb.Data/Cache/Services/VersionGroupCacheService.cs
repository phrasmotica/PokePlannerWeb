using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of version group resources in the cache.
    /// </summary>
    public class VersionGroupCacheService : CacheServiceBase<VersionGroup>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupCacheService(
            ICacheSource<VersionGroup> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<VersionGroup>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
