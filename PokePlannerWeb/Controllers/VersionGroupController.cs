using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Services;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Models;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting version groups.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class VersionGroupController : ResourceController<VersionGroup>
    {
        /// <summary>
        /// The names service.
        /// </summary>
        private readonly VersionGroupsNamesService VersionGroupsNamesService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupController(VersionGroupsNamesService versionGroupsNamesService, ILogger<ResourceController<VersionGroup>> logger) : base(logger)
        {
            VersionGroupsNamesService = versionGroupsNamesService;
        }

        /// <summary>
        /// Loads the version group data from PokeAPI.
        /// </summary>
        protected override Task LoadResources()
        {
            return VersionGroupData.Instance.LoadData();
        }

        /// <summary>
        /// Returns the names of all version groups.
        /// </summary>
        [HttpGet("all")]
        public async Task<string[]> GetVersionGroups()
        {
            Logger.LogInformation("VersionGroupController: getting version group names...");
            return await VersionGroupsNamesService.GetVersionGroupNames();
        }

        /// <summary>
        /// Returns the index of the selected version group.
        /// </summary>
        [HttpGet("selected")]
        public int GetSelectedVersionGroup()
        {
            var index = VersionGroupData.Instance.VersionGroupIndex;
            Logger.LogInformation($"VersionGroupController: selected version group index is {index}");
            return index;
        }

        /// <summary>
        /// Sets the index of the selected version group.
        /// </summary>
        [HttpPost("selected")]
        public void SetSelectedVersionGroup([FromBody] SetSelectedVersionGroupModel requestBody)
        {
            var newIndex = requestBody.Index;
            Logger.LogInformation($"VersionGroupController: setting selected version group index to {newIndex}");
            VersionGroupData.Instance.VersionGroupIndex = requestBody.Index;
        }
    }
}
