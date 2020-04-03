using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of generation resources in the cache.
    /// </summary>
    public class GenerationCacheService : CacheServiceBase<Generation>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public GenerationCacheService(
            ICacheSource<Generation> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Generation>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
