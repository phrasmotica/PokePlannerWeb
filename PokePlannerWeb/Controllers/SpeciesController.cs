using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
    }
}
