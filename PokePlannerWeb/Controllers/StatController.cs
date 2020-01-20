using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting stats.
    /// </summary>
    public class StatController : ResourceController<Stat>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public StatController(ILogger<ResourceController<Stat>> logger) : base(logger)
        {
        }

        /// <summary>
        /// Loads the stat data from PokeAPI.
        /// </summary>
        protected override Task LoadResources()
        {
            return StatData.Instance.LoadData();
        }

        /// <summary>
        /// Returns the names of the base stats in the version group with the given ID.
        /// </summary>
        [HttpGet("baseStatNames/{versionGroupId:int}")]
        public string[] GetBaseStatNamesInVersionGroup(int versionGroupId)
        {
            Logger.LogInformation($"Getting names of base stats in version group {versionGroupId}...");
            return StatData.Instance.GetBaseStatNames(versionGroupId).ToArray();
        }
    }
}
