using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of move category resources in the cache.
    /// </summary>
    public class MoveCategoryCacheService : CacheServiceBase<MoveCategory>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveCategoryCacheService(
            ICacheSource<MoveCategory> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<MoveCategory>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
