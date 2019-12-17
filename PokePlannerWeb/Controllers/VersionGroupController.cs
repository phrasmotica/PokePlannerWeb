using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
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
            await PokeApiData.Instance.LoadVersionGroups();
        }

        /// <summary>
        /// Loads the version group data from PokeAPI.
        /// </summary>
        [HttpGet("all")]
        public async Task<List<string>> GetVersionGroups()
        {
            var versionGroups = new List<string>();
            foreach (var vg in PokeApiData.Instance.VersionGroups)
            {
                var name = await vg.GetName();
                versionGroups.Add(name);
            }

            return versionGroups;
        }

        /// <summary>
        /// Returns the name of the selected version group.
        /// </summary>
        [HttpGet("selected")]
        public async Task<string> GetSelectedVersionGroup()
        {
            return await PokeApiData.Instance.VersionGroup.GetName();
        }

        /// <summary>
        /// Returns the name of the selected version group.
        /// </summary>
        [HttpPost("selected")]
        public void SetSelectedVersionGroup([FromBody] SetSelectedVersionGroupModel versionGroup)
        {
            PokeApiData.Instance.SetVersionGroup(versionGroup.Index);
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
