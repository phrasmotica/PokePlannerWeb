using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of move damage class resources in the cache.
    /// </summary>
    public class MoveDamageClassCacheService : CacheServiceBase<MoveDamageClass>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveDamageClassCacheService(
            ICacheSource<MoveDamageClass> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<MoveDamageClass>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
