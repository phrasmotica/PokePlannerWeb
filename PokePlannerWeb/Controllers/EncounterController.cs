using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting LocationAreaEncounter resources.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class EncounterController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<EncounterController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncounterController(ILogger<EncounterController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of the locations where the Pokemon with the given ID can be found in
        /// the version group with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/{versionGroupId:int}")]
        public async Task<string[]> GetCaptureLocationNames(int pokemonId, int versionGroupId)
        {
            var encounters = await GetLocationAreaEncountersInVersionGroup(pokemonId, versionGroupId);

            var locations = new string[encounters.Length];
            for (var i = 0; i < encounters.Length; i++)
            {
                var encounter = encounters[i];
                var locationArea = await PokeAPI.Get(encounter.LocationArea);
                var location = await PokeAPI.Get(locationArea.Location);
                locations[i] = location.GetEnglishName();
            }

            return locations.ToArray();
        }

        /// <summary>
        /// Returns the location area encounters of the Pokemon with the given ID in the version
        /// group with the given ID.
        /// </summary>
        private async Task<LocationAreaEncounter[]> GetLocationAreaEncountersInVersionGroup(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting encounters for Pokemon {pokemonId} in version group {versionGroupId}...");
            var encounters = await PokeAPI.Instance.GetLocationAreaEncounters(pokemonId);
            return encounters.Where(e => IsInVersionGroup(e, versionGroupId)).ToArray();
        }

        /// <summary>
        /// Returns whether the given encounter is present in the given version group ID.
        /// </summary>
        private bool IsInVersionGroup(LocationAreaEncounter encounter, int versionGroupId)
        {
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId];
            var versions = versionGroup.Versions.Select(v => v.Name);
            var encounterVersions = encounter.VersionDetails.Select(vd => vd.Version.Name);

            return versions.Intersect(encounterVersions).Any();
        }
    }
}
