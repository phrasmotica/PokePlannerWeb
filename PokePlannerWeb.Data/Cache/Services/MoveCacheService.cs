using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of move resources in the cache.
    /// </summary>
    public class MoveCacheService : CacheServiceBase<Move>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveCacheService(
            ICacheSource<Move> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Move>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
