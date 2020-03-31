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
    /// Service for managing the stat entries in the database.
    /// </summary>
    public class StatsService : NamedApiResourceServiceBase<Stat, StatEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public StatsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<StatsService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the stat collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<StatEntry>(settings.StatsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the stat with the given ID from the database.
        /// </summary>
        protected override StatEntry Get(int statId)
        {
            return Collection.Find(p => p.StatId == statId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new stat in the database and returns it.
        /// </summary>
        protected override StatEntry Create(StatEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the stat with the given ID from the database.
        /// </summary>
        protected override void Remove(int statId)
        {
            Collection.DeleteOne(p => p.StatId == statId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Type with the given ID.
        /// </summary>
        protected override async Task<Stat> FetchSource(int typeId)
        {
            Logger.LogInformation($"Fetching stat source object with ID {typeId}...");
            return await PokeApi.Get<Stat>(typeId);
        }

        /// <summary>
        /// Returns a Type entry for the given Type.
        /// </summary>
        protected override Task<StatEntry> ConvertToEntry(Stat stat)
        {
            var displayNames = stat.Names.ToDisplayNames();

            return Task.FromResult(new StatEntry
            {
                StatId = stat.Id,
                Name = stat.Name,
                IsBattleOnly = stat.IsBattleOnly,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all stats.
        /// </summary>
        public async Task<StatEntry[]> GetAll()
        {
            var allStats = await UpsertAll();
            return allStats.ToArray();
        }

        /// <summary>
        /// Returns all stats in the version group with the given ID.
        /// </summary>
        public async Task<StatEntry[]> GetBaseStats(int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats in version group with ID {versionGroupId}...");
            var allStats = await GetAll();
            return allStats.Where(e => !e.IsBattleOnly).ToArray();
        }

        #endregion
    }
}
