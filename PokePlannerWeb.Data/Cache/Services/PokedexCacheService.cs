using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of pokedex resources in the cache.
    /// </summary>
    public class PokedexCacheService : CacheServiceBase<Pokedex>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokedexCacheService(
            ICacheSource<Pokedex> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Pokedex>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
