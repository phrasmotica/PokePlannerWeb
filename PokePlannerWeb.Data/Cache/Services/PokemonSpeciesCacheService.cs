﻿using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of Pokemon species resources in the cache.
    /// </summary>
    public class PokemonSpeciesCacheService : NamedCacheServiceBase<PokemonSpecies>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonSpeciesCacheService(
            INamedCacheSource<PokemonSpecies> cacheSource,
            IPokeAPI pokeApi,
            ILogger<PokemonSpeciesCacheService> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
