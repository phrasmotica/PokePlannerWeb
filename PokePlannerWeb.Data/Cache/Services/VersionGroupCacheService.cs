﻿using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Abstractions;

namespace PokePlannerWeb.Data.Cache.Services
{
    /// <summary>
    /// Service for managing the collection of version group resources in the cache.
    /// </summary>
    public class VersionGroupCacheService : NamedCacheServiceBase<VersionGroup>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupCacheService(
            INamedCacheSource<VersionGroup> cacheSource,
            IPokeAPI pokeApi,
            ILogger<VersionGroupCacheService> logger) : base(cacheSource, pokeApi, logger)
        {
        }
    }
}
