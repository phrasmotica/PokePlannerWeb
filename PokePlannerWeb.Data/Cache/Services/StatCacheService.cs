using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of stat resources in the cache.
    /// </summary>
    public class StatCacheService : CacheServiceBase<Stat>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public StatCacheService(
            ICacheSource<Stat> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Stat>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
