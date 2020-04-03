using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of Pokemon resources in the cache.
    /// </summary>
    public class PokemonCacheService : CacheServiceBase<Pokemon>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonCacheService(
            ICacheSource<Pokemon> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Pokemon>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
