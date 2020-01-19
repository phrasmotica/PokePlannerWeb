using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing a collection in the database.
    /// </summary>
    public abstract class ServiceBase<TSource, TEntry> where TEntry : EntryBase
    {
        /// <summary>
        /// The collection of entries.
        /// </summary>
        protected IMongoCollection<TEntry> Collection;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<ServiceBase<TSource, TEntry>> Logger;

        /// <summary>
        /// Create connection to database and initalise logger.
        /// </summary>
        public ServiceBase(IPokePlannerWebDbSettings settings, ILogger<ServiceBase<TSource, TEntry>> logger)
        {
            SetCollection(settings);
            Logger = logger;
        }

        /// <summary>
        /// Creates a connection to the collection in the database.
        /// </summary>
        protected abstract void SetCollection(IPokePlannerWebDbSettings settings);

        /// <summary>
        /// Gets the time to live for documents in the collection.
        /// </summary>
        protected virtual TimeSpan TimeToLive { get; } = TimeSpan.FromDays(365);

        #region CRUD methods

        /// <summary>
        /// Returns the entry with the given ID from the database.
        /// </summary>
        public abstract TEntry Get(int id);

        /// <summary>
        /// Creates a new entry in the database and returns it.
        /// </summary>
        public abstract TEntry Create(TEntry entry);

        /// <summary>
        /// Removes the entry with the given ID and creates a new one in the database.
        /// </summary>
        public void Update(int id, TEntry entry)
        {
            Remove(id);
            Create(entry);
        }

        /// <summary>
        /// Removes the entry with the given ID from the database.
        /// </summary>
        public abstract void Remove(int id);

        #endregion

        /// <summary>
        /// Returns the entry with the given ID from the database, creating the entry if it doesn't exist.
        /// </summary>
        public async Task<TEntry> GetOrCreate(int id)
        {
            var entry = Get(id);
            if (entry == null)
            {
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"Creating {entryType} entry for {sourceType} {id} in database...");

                entry = await FetchSourceAndCreateEntry(id);
            }
            else if (entry.CreationTime < DateTime.UtcNow - TimeToLive)
            {
                // update entry if it's exceeded its TTL
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"{entryType} entry with id {id} exceeded TTL.");
                Logger.LogInformation($"Creating {entryType} entry for {sourceType} {id} in database...");

                entry = await FetchSourceAndUpdateEntry(id);
            }

            return entry;
        }

        /// <summary>
        /// Fetches the source object with the given ID and creates an entry for it.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndCreateEntry(int id)
        {
            // fetch source
            var source = await FetchSource(id);

            // create entry
            return await CreateEntry(source);
        }

        /// <summary>
        /// Fetches the source object with the given ID, updates the entry for it and returns the entry.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndUpdateEntry(int id)
        {
            // fetch source
            var source = await FetchSource(id);

            // update entry
            await UpdateEntry(id, source);

            return Get(id);
        }

        /// <summary>
        /// Returns the source object required to create an entry with the given ID.
        /// </summary>
        protected abstract Task<TSource> FetchSource(int id);

        /// <summary>
        /// Creates a new entry in the database for the source object and returns it.
        /// </summary>
        protected async Task<TEntry> CreateEntry(TSource source)
        {
            var entry = await ConvertToEntry(source);
            return Create(entry);
        }

        /// <summary>
        /// Updates the entry with the given ID in the database for the source object.
        /// </summary>
        protected async Task UpdateEntry(int id, TSource source)
        {
            var entry = await ConvertToEntry(source);
            Update(id, entry);
        }

        /// <summary>
        /// Returns an entry for the given source object.
        /// </summary>
        protected abstract Task<TEntry> ConvertToEntry(TSource pokemon);
    }
}
