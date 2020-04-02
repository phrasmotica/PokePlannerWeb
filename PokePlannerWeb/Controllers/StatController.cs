using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting stats.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class StatController : ControllerBase
    {
        /// <summary>
        /// The stats service.
        /// </summary>
        private readonly StatService StatsService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<StatService> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public StatController(StatService statsService, ILogger<StatService> logger)
        {
            StatsService = statsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of the base stats in the version group with the given ID.
        /// </summary>
        [HttpGet("baseStatNames/{versionGroupId:int}")]
        public async Task<string[]> GetBaseStatNamesInVersionGroup(int versionGroupId)
        {
            Logger.LogInformation($"Getting names of base stats in version group {versionGroupId}...");
            var allStats = await StatsService.GetBaseStats(versionGroupId);
            return allStats.Select(s => s.GetDisplayName()).ToArray();
        }
    }
}
