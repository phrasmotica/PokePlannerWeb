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
    public class VersionGroupController : ControllerBase
    {
        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupService VersionGroupsService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<VersionGroupController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupController(
            VersionGroupService versionGroupsService,
            ILogger<VersionGroupController> logger)
        {
            VersionGroupsService = versionGroupsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all version groups.
        /// </summary>
        [HttpGet("all")]
        public async Task<VersionGroupEntry[]> GetVersionGroups()
        {
            Logger.LogInformation("VersionGroupController: getting version groups...");
            return await VersionGroupsService.GetAll();
        }
    }
}
