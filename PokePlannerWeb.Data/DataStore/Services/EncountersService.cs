using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for accessing encounters data.
    /// </summary>
    public class EncountersService
    {
        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected IPokeAPI PokeApi;

        /// <summary>
        /// The type data singleton.
        /// </summary>
        private readonly VersionGroupData VersionGroupData;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<EncountersService> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncountersService(
            IPokeAPI pokeApi,
            VersionGroupData versionGroupData,
            ILogger<EncountersService> logger)
        {
            PokeApi = pokeApi;
            VersionGroupData = versionGroupData;
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of the locations where the Pokemon with the given ID can be found in
        /// the version group with the given ID.
        /// </summary>
        public async Task<string[]> GetCaptureLocationNames(int pokemonId, int versionGroupId)
        {
            var encounters = await GetLocationAreaEncountersInVersionGroup(pokemonId, versionGroupId);

            var locations = new string[encounters.Length];
            for (var i = 0; i < encounters.Length; i++)
            {
                // TODO: store locations in MongoDB
                var encounter = encounters[i];
                var locationArea = await PokeApi.Get(encounter.LocationArea);
                var location = await PokeApi.Get(locationArea.Location);
                locations[i] = location.Names.GetName();
            }

            return locations.ToArray();
        }

        #region Helpers

        /// <summary>
        /// Returns the location area encounters of the Pokemon with the given ID in the version
        /// group with the given ID.
        /// </summary>
        private async Task<LocationAreaEncounter[]> GetLocationAreaEncountersInVersionGroup(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting encounters for Pokemon {pokemonId} in version group {versionGroupId}...");
            var encounters = await PokeApi.GetLocationAreaEncounters(pokemonId);
            return encounters.Where(e => IsInVersionGroup(e, versionGroupId)).ToArray();
        }

        /// <summary>
        /// Returns whether the given encounter is present in the given version group ID.
        /// </summary>
        private bool IsInVersionGroup(LocationAreaEncounter encounter, int versionGroupId)
        {
            var versionGroup = VersionGroupData.Get(versionGroupId);
            var versions = versionGroup.Versions.Select(v => v.Name);
            var encounterVersions = encounter.VersionDetails.Select(vd => vd.Version.Name);

            return versions.Intersect(encounterVersions).Any();
        }

        #endregion
    }
}
