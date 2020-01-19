﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Cache;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Species resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class SpeciesController : ControllerBase
    {
        /// <summary>
        /// The Pokemon varieties service.
        /// </summary>
        private readonly PokemonVarietiesService PokemonVarietiesService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<SpeciesController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public SpeciesController(PokemonVarietiesService pokemonVarietiesService, ILogger<SpeciesController> logger)
        {
            PokemonVarietiesService = pokemonVarietiesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of all species.
        /// </summary>
        [HttpGet("allNames")]
        public string[] GetAllSpeciesNames()
        {
            Logger.LogInformation($"Getting names of all species...");

            // read species names from cache
            return PokemonSpeciesCacheManager.Instance.GetAllSpeciesNames();
        }

        /// <summary>
        /// Returns the IDs of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/ids")]
        public async Task<int[]> GetSpeciesVarietyIdsById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of varieties of species of Pokemon {id} in version group {versionGroupId}...");

            // get varieties document from database
            var entry = await PokemonVarietiesService.GetOrCreate(id);
            return entry.GetVarietyIds().ToArray();
        }

        /// <summary>
        /// Returns the names of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/names")]
        public async Task<string[]> GetSpeciesVarietyNamesById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting names of varieties of species of Pokemon {id} in version group {versionGroupId}...");

            // get varieties document from database
            var entry = await PokemonVarietiesService.GetOrCreate(id);
            return entry.GetVarietyDisplayNames().ToArray();
        }
    }
}
