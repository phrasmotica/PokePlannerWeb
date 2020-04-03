using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of Pokemon form resources in the cache.
    /// </summary>
    public class PokemonFormCacheService : CacheServiceBase<PokemonForm>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonFormCacheService(
            ICacheSource<PokemonForm> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<PokemonForm>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
