using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of type resources in the cache.
    /// </summary>
    public class TypeCacheService : CacheServiceBase<Type>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public TypeCacheService(
            ICacheSource<Type> cacheSource,
            IPokeAPI pokeApi,
            ILogger<CacheServiceBase<Type>> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
