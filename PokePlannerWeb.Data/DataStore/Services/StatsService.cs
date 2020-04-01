using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
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
            ICacheSource<StatEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<StatsService> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region CRUD methods

        /// <summary>
        /// Returns the stat with the given ID from the database.
        /// </summary>
        protected override StatEntry Get(int statId)
        {
            return CacheSource.GetOne(s => s.StatId == statId);
        }

        /// <summary>
        /// Removes the stat with the given ID from the database.
        /// </summary>
        protected override void Remove(int statId)
        {
            CacheSource.DeleteOne(s => s.StatId == statId);
        }

        #endregion

        #region Entry conversion methods

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
