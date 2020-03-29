using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

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
        /// The encounters service.
        /// </summary>
        private readonly EncountersService EncountersService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<EncounterController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncounterController(EncountersService encountersService, ILogger<EncounterController> logger)
        {
            EncountersService = encountersService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the locations where the Pokemon with the given ID can be found in the version
        /// group with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}")]
        public async Task<EncountersEntry> GetCaptureLocations(int pokemonId)
        {
            Logger.LogInformation($"Getting capture locations for Pokemon {pokemonId}...");
            return await EncountersService.GetEncounters(pokemonId);
        }
    }
}
