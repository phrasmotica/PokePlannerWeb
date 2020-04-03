using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of version resources in the cache.
    /// </summary>
    public class VersionCacheService : CacheServiceBase<Version>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionCacheService(
            ICacheSource<Version> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Version>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
