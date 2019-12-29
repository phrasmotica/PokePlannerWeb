using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;

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
        /// The logger.
        /// </summary>
        private readonly ILogger<SpeciesController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public SpeciesController(ILogger<SpeciesController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of all species.
        /// </summary>
        [HttpGet("allNames")]
        public async Task<string[]> GetAllSpeciesNames()
        {
            Logger.LogInformation($"Getting names of all species...");
            return await SpeciesData.Instance.GetAllSpeciesNames();
        }

        /// <summary>
        /// Returns the IDs of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/ids")]
        public async Task<int[]> GetSpeciesVarietyIdsById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of varieties of species of Pokemon {id} in version group {versionGroupId}...");
            var species = await PokeAPI.Get<PokemonSpecies>(id);
            return await species.GetVarietyIDs(versionGroupId);
        }

        /// <summary>
        /// Returns the names of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/names")]
        public async Task<string[]> GetSpeciesVarietyNamesById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting names of varieties of species of Pokemon {id} in version group {versionGroupId}...");
            var species = await PokeAPI.Get<PokemonSpecies>(id);
            return await species.GetVarietyNames(versionGroupId);
        }
    }
}
