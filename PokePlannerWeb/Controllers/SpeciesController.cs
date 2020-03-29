﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Species resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class SpeciesController
    {
        /// <summary>
        /// The Pokemon species service.
        /// </summary>
        private readonly PokemonSpeciesService PokemonSpeciesService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<SpeciesController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public SpeciesController(
            PokemonSpeciesService pokemonSpeciesService,
            ILogger<SpeciesController> logger)
        {
            PokemonSpeciesService = pokemonSpeciesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all Pokemon species.
        /// </summary>
        [HttpGet("all")]
        public async Task<PokemonSpeciesEntry[]> GetPokemonSpecies()
        {
            Logger.LogInformation("Getting all Pokemon species...");
            return await PokemonSpeciesService.GetPokemonSpecies();
        }

        /// <summary>
        /// Returns the varieties of the Pokemon species with the given ID in the version group with
        /// the given ID.
        /// </summary>
        [HttpGet("{speciesId:int}/varieties/{versionGroupId:int}")]
        public async Task<PokemonEntry[]> GetPokemonSpeciesVarieties(int speciesId, int versionGroupId)
        {
            Logger.LogInformation($"Getting varieties of Pokemon species {speciesId} in version group {versionGroupId}...");
            return await PokemonSpeciesService.GetPokemonSpeciesVarieties(speciesId, versionGroupId);
        }
    }
}
