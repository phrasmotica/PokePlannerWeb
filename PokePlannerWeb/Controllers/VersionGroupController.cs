using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using System.Threading.Tasks;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting version groups.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class VersionGroupController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<VersionGroupController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupController(ILogger<VersionGroupController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Loads the version group data from PokeAPI.
        /// </summary>
        [HttpGet]
        public async Task LoadVersionGroups()
        {
            await PokeApiData.Instance.LoadLatestVersionGroup();
        }

        /// <summary>
        /// Returns the version group with the given name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<VersionGroup> GetVersionGroupByName(string name)
        {
            Logger.LogInformation($"Getting version group \"{name}\"...");
            return await PokeApiData.Instance.Get<VersionGroup>(name);
        }
    }
}
