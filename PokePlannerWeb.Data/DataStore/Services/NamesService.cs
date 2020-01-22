using System;
using System.Linq;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing a list of localised names in the database.
    /// </summary>
    public class NamesService
    {
        /// <summary>
        /// The collection of localised names entries.
        /// </summary>
        protected IMongoCollection<NamesEntry> Collection;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<NamesService> Logger;

        /// <summary>
        /// Create connection to database and initalise logger.
        /// </summary>
        public NamesService(IPokePlannerWebDbSettings settings, ILogger<NamesService> logger)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<NamesEntry>(settings.NamesCollectionName);
            Logger = logger;
        }

        /// <summary>
        /// Gets the time to live for localised names in the entries.
        /// </summary>
        protected virtual TimeSpan TimeToLive { get; } = TimeSpan.FromDays(365);

        #region CRUD methods

        /// <summary>
        /// Returns the names entry with the given resource key from the database.
        /// </summary>
        protected NamesEntry Get(string resourceKey, string locale = "en")
        {
            return Collection.Find(n => n.ResourceKey == resourceKey && n.Locale == locale).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new names entry in the database and returns it.
        /// </summary>
        protected NamesEntry Create(NamesEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the names entry with the given resource key and creates a new one in the database.
        /// </summary>
        protected void Update(string resourceKey, NamesEntry entry, string locale = "en")
        {
            Remove(resourceKey, locale);
            Create(entry);
        }

        /// <summary>
        /// Removes the names entry with the given resource key from the database.
        /// </summary>
        protected void Remove(string resourceKey, string locale = "en")
        {
            Collection.DeleteOne(n => n.ResourceKey == resourceKey && n.Locale == locale);
        }

        #endregion
    }
}
