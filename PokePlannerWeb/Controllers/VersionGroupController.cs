using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Models;

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
        [HttpPost]
        public async Task LoadVersionGroups()
        {
            await VersionGroupData.Instance.LoadVersionGroups();
        }

        /// <summary>
        /// Loads the version group data from PokeAPI.
        /// </summary>
        [HttpGet("all")]
        public async Task<List<string>> GetVersionGroups()
        {
            var versionGroups = new List<string>();
            foreach (var vg in VersionGroupData.Instance.VersionGroups)
            {
                var name = await vg.GetName();
                versionGroups.Add(name);
            }

            return versionGroups;
        }

        /// <summary>
        /// Returns the index of the selected version group.
        /// </summary>
        [HttpGet("selected")]
        public int GetSelectedVersionGroup()
        {
            return VersionGroupData.Instance.VersionGroupIndex;
        }

        /// <summary>
        /// Sets the index of the selected version group.
        /// </summary>
        [HttpPost("selected")]
        public void SetSelectedVersionGroup([FromBody] SetSelectedVersionGroupModel requestBody)
        {
            VersionGroupData.Instance.VersionGroupIndex = requestBody.Index;
        }

        /// <summary>
        /// Returns the version group with the given name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<VersionGroup> GetVersionGroupByName(string name)
        {
            Logger.LogInformation($"Getting version group \"{name}\"...");
            return await PokeAPI.Get<VersionGroup>(name);
        }
    }
}
