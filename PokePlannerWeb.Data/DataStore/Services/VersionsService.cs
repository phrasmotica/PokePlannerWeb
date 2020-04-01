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
    /// Service for managing the version entries in the database.
    /// </summary>
    public class VersionsService : NamedApiResourceServiceBase<Version, VersionEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionsService(
            ICacheSource<VersionEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<VersionsService> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region CRUD methods

        /// <summary>
        /// Returns the version with the given ID from the database.
        /// </summary>
        protected override VersionEntry Get(int versionId)
        {
            return CacheSource.GetOne(v => v.VersionId == versionId);
        }

        /// <summary>
        /// Removes the version with the given ID from the database.
        /// </summary>
        protected override void Remove(int versionId)
        {
            CacheSource.DeleteOne(v => v.VersionId == versionId);
        }

        #endregion

        #region Entry conversion methods

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
