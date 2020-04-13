using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for accessing evolution chain resources.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class EvolutionChainController : ControllerBase
    {
        /// <summary>
        /// The evolution chain service.
        /// </summary>
        private readonly EvolutionChainService EvolutionChainService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<EvolutionChainController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EvolutionChainController(EvolutionChainService evolutionChainService, ILogger<EvolutionChainController> logger)
        {
            EvolutionChainService = evolutionChainService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the evolution chain for the species with the given ID.
        /// </summary>
        [HttpGet("{speciesId:int}")]
        public async Task<EvolutionChainEntry> GetEvolutionChainBySpeciesId(int speciesId)
        {
            Logger.LogInformation($"Getting evolution chain {speciesId}...");
            return await EvolutionChainService.GetBySpeciesId(speciesId);
        }
    }
}
