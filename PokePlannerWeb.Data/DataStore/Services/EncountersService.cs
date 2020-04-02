using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for accessing encounters data.
    /// </summary>
    public class EncountersService : ServiceBase<Pokemon, EncountersEntry>
    {
        /// <summary>
        /// The locations service.
        /// </summary>
        private readonly LocationService LocationsService;

        /// <summary>
        /// The location areas service.
        /// </summary>
        private readonly LocationAreaService LocationAreasService;

        /// <summary>
        /// The versions service.
        /// </summary>
        private readonly VersionService VersionsService;

        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupService VersionGroupsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EncountersService(
            IDataStoreSource<EncountersEntry> dataStoreSource,
            IPokeAPI pokeApi,
            LocationService locationsService,
            LocationAreaService locationAreasService,
            VersionService versionsService,
            VersionGroupService versionGroupsService,
            ILogger<EncountersService> logger) : base(dataStoreSource, pokeApi, logger)
        {
            LocationsService = locationsService;
            LocationAreasService = locationAreasService;
            VersionsService = versionsService;
            VersionGroupsService = versionGroupsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<Pokemon> FetchSource(int pokemonId)
        {
            Logger.LogInformation($"Fetching Pokemon source object with ID {pokemonId}...");
            return await PokeApi.Get<Pokemon>(pokemonId);
        }

        /// <summary>
        /// Returns a location area encounters entry for the given Pokemon.
        /// </summary>
        protected override async Task<EncountersEntry> ConvertToEntry(Pokemon pokemon)
        {
            var encounters = await GetEncounters(pokemon);

            return new EncountersEntry
            {
                Key = pokemon.Id,
                Encounters = encounters.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the encounters of the Pokemon with the given ID.
        /// </summary>
        public async Task<EncountersEntry> GetEncounters(int pokemonId)
        {
            return await Upsert(pokemonId);
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the Pokemon's encounters in all version groups.
        /// </summary>
        private async Task<List<WithId<EncounterEntry[]>>> GetEncounters(Pokemon pokemon)
        {
            var encounterEntriesList = new List<WithId<EncounterEntry[]>>();

            // enumerate version groups spanned by this Pokemon's encounters
            var encounters = await PokeApi.GetEncounters(pokemon);
            var versions = await VersionsService.UpsertMany(encounters.GetDistinctVersions());
            var versionGroups = await VersionGroupsService.UpsertManyByVersionIds(versions.Select(v => v.VersionId));

            foreach (var vg in versionGroups)
            {
                var relevantEncounters = encounters.Where(e => IsInVersionGroup(e, vg));

                // create entries for relevant encounters
                var encounterEntries = new List<EncounterEntry>();
                foreach (var encounter in relevantEncounters)
                {
                    var displayNames = await GetDisplayNames(encounter);

                    // filter to relevant version details
                    var relevantVersionDetails = encounter.VersionDetails.Where(vd =>
                    {
                        var versionName = vd.Version.Name;
                        return vg.Versions.Select(v => v.Name).Contains(versionName);
                    });

                    var chances = await GetChances(relevantVersionDetails);

                    var encounterEntry = new EncounterEntry
                    {
                        DisplayNames = displayNames.ToList(),
                        Chances = chances.ToList()
                    };

                    encounterEntries.Add(encounterEntry);
                }

                // add encounter entries to list indexed by version group ID
                var entryList = new WithId<EncounterEntry[]>(vg.VersionGroupId, encounterEntries.ToArray());
                encounterEntriesList.Add(entryList);
            }

            return encounterEntriesList;
        }

        /// <summary>
        /// Returns whether the given encounter is present in the given version group.
        /// </summary>
        private bool IsInVersionGroup(LocationAreaEncounter encounter, VersionGroupEntry versionGroup)
        {
            var versions = versionGroup.Versions.Select(v => v.Name);
            var encounterVersions = encounter.VersionDetails.Select(vd => vd.Version.Name);

            return versions.Intersect(encounterVersions).Any();
        }

        /// <summary>
        /// Returns the display names of the given encounter.
        /// </summary>
        private async Task<IEnumerable<DisplayName>> GetDisplayNames(LocationAreaEncounter encounter)
        {
            var locationArea = await LocationAreasService.Upsert(encounter.LocationArea);
            var locationAreaNames = locationArea.DisplayNames;

            var location = await LocationsService.Upsert(locationArea.Location.Id);
            var locationNames = location.DisplayNames;

            // only provide names in locales that have name data for both location and location area
            var availableLocales = locationNames.Select(n => n.Language)
                                                .Intersect(locationAreaNames.Select(n => n.Language));

            var displayNames = availableLocales.Select(l =>
            {
                var name = locationNames.Single(n => n.Language == l).Name;

                var locationAreaName = locationAreaNames.Single(n => n.Language == l).Name;
                if (!string.IsNullOrEmpty(locationAreaName))
                {
                    name += $" ({locationAreaName})";
                }

                return new DisplayName
                {
                    Language = l,
                    Name = name
                };
            });

            return displayNames;
        }

        /// <summary>
        /// Returns the chances of the given encounter indexed by version ID.
        /// </summary>
        private async Task<IEnumerable<WithId<int>>> GetChances(IEnumerable<VersionEncounterDetail> encounterDetails)
        {
            var chancesList = new List<WithId<int>>();

            foreach (var vd in encounterDetails)
            {
                var version = await VersionsService.Upsert(vd.Version);
                var chance = new WithId<int>(version.VersionId, vd.MaxChance);
                chancesList.Add(chance);
            }

            return chancesList;
        }

        #endregion
    }
}
