using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting version groups.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class GenerationController : ControllerBase
    {
        /// <summary>
        /// The generation service.
        /// </summary>
        private readonly GenerationService GenerationService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<GenerationController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public GenerationController(
            GenerationService versionGroupsService,
            ILogger<GenerationController> logger)
        {
            GenerationService = versionGroupsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all generations.
        /// </summary>
        public async Task<GenerationEntry[]> GetGenerations()
        {
            Logger.LogInformation("Getting generations...");
            return await GenerationService.GetAll();
        }
    }
}
