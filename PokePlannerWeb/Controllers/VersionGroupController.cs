using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;
using PokePlannerWeb.Data.Mechanics;

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
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupsService VersionGroupsService;

        /// <summary>
        /// The names service.
        /// </summary>
        private readonly VersionGroupsNamesService VersionGroupsNamesService;

        /// <summary>
        /// The version group data singleton.
        /// </summary>
        protected readonly VersionGroupData VersionGroupData;

        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupController(
            VersionGroupsService versionGroupsService,
            VersionGroupsNamesService versionGroupsNamesService,
            VersionGroupData versionGroupData,
            ILogger<ResourceController<VersionGroup>> logger) : base(logger)
        {
            VersionGroupsService = versionGroupsService;
            VersionGroupsNamesService = versionGroupsNamesService;
            VersionGroupData = versionGroupData;
        }

        /// <summary>
        /// Loads the version group data from PokeAPI.
        /// </summary>
        protected override Task LoadResources()
        {
            return VersionGroupData.LoadData();
        }

        /// <summary>
        /// Returns the names of all version groups.
        /// </summary>
        [HttpGet("names")]
        public async Task<string[]> GetVersionGroupNames()
        {
            Logger.LogInformation("VersionGroupController: getting version group names...");
            return await VersionGroupsNamesService.GetVersionGroupNames();
        }

        /// <summary>
        /// Returns all version groups.
        /// </summary>
        [HttpGet("all")]
        public async Task<VersionGroupEntry[]> GetVersionGroups()
        {
            Logger.LogInformation("VersionGroupController: getting version groups...");
            return await VersionGroupsService.GetVersionGroups();
        }
    }
}
