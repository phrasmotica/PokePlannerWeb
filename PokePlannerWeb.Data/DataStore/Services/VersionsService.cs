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
    /// Service for managing the version entries in the database.
    /// </summary>
    public class VersionsService : ServiceBase<Version, int, VersionEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<VersionsService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the version collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<VersionEntry>(settings.VersionsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the version with the given ID from the database.
        /// </summary>
        protected override VersionEntry Get(int versionId)
        {
            return Collection.Find(p => p.VersionId == versionId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new version in the database and returns it.
        /// </summary>
        protected override VersionEntry Create(VersionEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the version with the given ID from the database.
        /// </summary>
        protected override void Remove(int versionId)
        {
            Collection.DeleteOne(v => v.VersionId == versionId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the version with the given ID.
        /// </summary>
        protected override async Task<Version> FetchSource(int versionId)
        {
            Logger.LogInformation($"Fetching version source object with ID {versionId}...");
            return await PokeApi.Get<Version>(versionId);
        }

        /// <summary>
        /// Returns a version entry for the given version.
        /// </summary>
        protected override Task<VersionEntry> ConvertToEntry(Version version)
        {
            var displayNames = version.Names.ToDisplayNames();

            return Task.FromResult(new VersionEntry
            {
                VersionId = version.Id,
                Name = version.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all versions.
        /// </summary>
        public async Task<VersionEntry[]> GetAll()
        {
            var allStats = await UpsertAll();
            return allStats.ToArray();
        }

        #endregion
    }
}
