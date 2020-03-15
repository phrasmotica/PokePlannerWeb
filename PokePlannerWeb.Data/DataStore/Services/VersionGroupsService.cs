using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the version group entries in the database.
    /// </summary>
    public class VersionGroupsService : ServiceBase<VersionGroup, int, VersionGroupEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<VersionGroupsService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the version groups collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<VersionGroupEntry>(settings.VersionGroupsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon forms entry with the given ID from the database.
        /// </summary>
        public override VersionGroupEntry Get(int versionGroupId)
        {
            return Collection.Find(p => p.VersionGroupId == versionGroupId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon forms entry in the database and returns it.
        /// </summary>
        public override VersionGroupEntry Create(VersionGroupEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon forms entry with the given ID from the database.
        /// </summary>
        public override void Remove(int versionGroupId)
        {
            Collection.DeleteOne(p => p.VersionGroupId == versionGroupId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<VersionGroup> FetchSource(int versionGroupId)
        {
            return await PokeApi.Get<VersionGroup>(versionGroupId);
        }

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        protected override async Task<VersionGroupEntry> ConvertToEntry(VersionGroup versionGroup)
        {
            var displayNames = await GetDisplayNames(versionGroup);

            return new VersionGroupEntry
            {
                VersionGroupId = versionGroup.Id,
                DisplayNames = displayNames.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all version groups.
        /// </summary>
        public async Task<VersionGroupEntry[]> GetVersionGroups()
        {
            var allVersionGroups = await GetAllOrCreate();
            return allVersionGroups.ToArray();
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the display names of the given version group in all locales.
        /// </summary>
        private async Task<IEnumerable<DisplayName>> GetDisplayNames(VersionGroup versionGroup)
        {
            // TODO: similar method in VersionGroupsNamesService
            var versions = await PokeApi.Get(versionGroup.Versions);
            var versionsNames = versions.Select(v => v.Names.OrderBy(n => n.Language.Name).ToList());
            var namesList = versionsNames.Aggregate(
                (nv1, nv2) => nv1.Zip(
                    nv2, (n1, n2) => new Names
                    {
                        Language = n1.Language,
                        Name = n1.Name + "/" + n2.Name
                    }
                ).ToList()
            );

            return namesList.ToDisplayNames();
        }

        #endregion
    }
}
