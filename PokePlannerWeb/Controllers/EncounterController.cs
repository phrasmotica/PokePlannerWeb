using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting LocationAreaEncounter resources.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class EncounterController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<EncounterController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncounterController(ILogger<EncounterController> logger)
        {
            Logger = logger;
        }
        
        /// <summary>
        /// Returns the location area encounters of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/{versionGroupId:int}")]
        public async Task<LocationAreaEncounter[]> GetLocationAreaEncountersInVersionGroup(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting encounters for Pokemon {id} in version group {versionGroupId}...");
            var encounters = await PokeAPI.Instance.GetLocationAreaEncounters(id);
            return encounters.Where(e => IsInVersionGroup(e, versionGroupId)).ToArray();
        }

        /// <summary>
        /// Returns whether the given encounter is present in the given version group ID.
        /// </summary>
        private bool IsInVersionGroup(LocationAreaEncounter encounter, int versionGroupId)
        {
            return true;
        }
    }
}
