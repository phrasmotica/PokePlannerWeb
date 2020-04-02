﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the pokedex entries in the database.
    /// </summary>
    public class PokedexesService : NamedApiResourceServiceBase<Pokedex, PokedexEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokedexesService(
            ICacheSource<PokedexEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<PokedexesService> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a version entry for the given version.
        /// </summary>
        protected override Task<PokedexEntry> ConvertToEntry(Pokedex pokedex)
        {
            var displayNames = pokedex.Names.ToDisplayNames();

            return Task.FromResult(new PokedexEntry
            {
                Key = pokedex.Id,
                Name = pokedex.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all pokedexes.
        /// </summary>
        public async Task<PokedexEntry[]> GetAll()
        {
            var allPokedexes = await UpsertAll();
            return allPokedexes.ToArray();
        }

        #endregion
    }
}
