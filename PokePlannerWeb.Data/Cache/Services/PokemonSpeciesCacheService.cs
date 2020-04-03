using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of Pokemon species resources in the cache.
    /// </summary>
    public class PokemonSpeciesCacheService : CacheServiceBase<PokemonSpecies>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonSpeciesCacheService(
            ICacheSource<PokemonSpecies> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<PokemonSpecies>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
