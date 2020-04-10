using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of move target resources in the cache.
    /// </summary>
    public class MoveTargetCacheService : CacheServiceBase<MoveTarget>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveTargetCacheService(
            ICacheSource<MoveTarget> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<MoveTarget>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
