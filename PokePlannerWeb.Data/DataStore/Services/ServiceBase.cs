using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing a collection in the database.
    /// </summary>
    public abstract class ServiceBase<TSource, TKey, TEntry>
        where TSource : NamedApiResource
        where TEntry : EntryBase<TKey>
    {
        /// <summary>
        /// The collection of entries.
        /// </summary>
        protected IMongoCollection<TEntry> Collection;

        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected IPokeAPI PokeApi;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<ServiceBase<TSource, TKey, TEntry>> Logger;

        /// <summary>
        /// Create connection to database and initalise logger.
        /// </summary>
        public ServiceBase(IPokePlannerWebDbSettings settings, IPokeAPI pokeApi, ILogger<ServiceBase<TSource, TKey, TEntry>> logger)
        {
            SetCollection(settings);
            PokeApi = pokeApi;
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
        public abstract TEntry Get(TKey key);

        /// <summary>
        /// Returns all entries from the database.
        /// </summary>
        public IEnumerable<TEntry> AllEntries => Collection.Find(_ => true).ToEnumerable();

        /// <summary>
        /// Creates a new entry in the database and returns it.
        /// </summary>
        public abstract TEntry Create(TEntry entry);

        /// <summary>
        /// Removes the entry with the given ID and creates a new one in the database.
        /// </summary>
        public void Update(TKey key, TEntry entry)
        {
            Remove(key);
            Create(entry);
        }

        /// <summary>
        /// Removes the entry with the given ID from the database.
        /// </summary>
        public abstract void Remove(TKey key);

        #endregion

        /// <summary>
        /// Returns the entry with the given ID from the database, creating the entry if it doesn't exist.
        /// </summary>
        public async Task<TEntry> GetOrCreate(TKey key)
        {
            var entry = Get(key);
            if (entry == null)
            {
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"Creating {entryType} entry for {sourceType} {key} in database...");

                // TODO: lots of calls overlap with initial entry creation, which thus trigger duplicate
                // entry creation. Easiest optimisation would be to have one call fetch the whole entry
                entry = await FetchSourceAndCreateEntry(key);
            }
            else if (IsStale(entry))
            {
                // update entry if it's stale
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"{entryType} entry with key {key} is stale.");
                Logger.LogInformation($"Updating {entryType} entry for {sourceType} {key} in database...");

                entry = await FetchSourceAndUpdateEntry(key);
            }

            return entry;
        }

        /// <summary>
        /// Upserts all entries into the database.
        /// </summary>
        public async Task<IEnumerable<TEntry>> UpsertAll(bool replace = false)
        {
            var resourcesPage = await PokeApi.GetPage<TSource>();

            var allEntries = AllEntries.ToList();
            if (!allEntries.Any() || allEntries.Count != resourcesPage.Count)
            {
                const int pageSize = 20;

                var entryList = new List<TEntry>();

                var pagesUsed = 0;
                NamedApiResourceList<TSource> page;
                do
                {
                    page = await PokeApi.GetPage<TSource>(pageSize, pageSize * pagesUsed++);
                    var entries = await UpsertMany(page, replace);
                    entryList.AddRange(entries);
                } while (!string.IsNullOrEmpty(page.Next));

                return entryList;
            }

            // if we have the right number of entries then we're probably good
            return allEntries;
        }

        /// <summary>
        /// Upserts many entries into the database.
        /// </summary>
        protected async Task<IEnumerable<TEntry>> UpsertMany(NamedApiResourceList<TSource> resources, bool replace = false)
        {
            var sourceType = typeof(TSource).Name;
            var entryType = typeof(TEntry).Name;
            Logger.LogInformation($"Upserting {resources.Results.Count} {entryType} entries for {sourceType} in database...");

            var sourceList = await PokeApi.Get(resources.Results);

            var entryList = new List<TEntry>();
            foreach (var o in sourceList)
            {
                var entry = await UpsertEntry(o, replace);
                entryList.Add(entry);
            }

            return entryList;
        }

        /// <summary>
        /// Fetches the source object with the given ID and creates an entry for it.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndCreateEntry(TKey key)
        {
            // fetch source
            var source = await FetchSource(key);

            // create entry
            return await CreateEntry(source);
        }

        /// <summary>
        /// Fetches the source object with the given ID, updates the entry for it and returns the entry.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndUpdateEntry(TKey key)
        {
            // fetch source
            var source = await FetchSource(key);

            // update entry
            await UpdateEntry(key, source);

            return Get(key);
        }

        /// <summary>
        /// Returns the source object required to create an entry with the given ID.
        /// </summary>
        protected abstract Task<TSource> FetchSource(TKey key);

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
        protected async Task UpdateEntry(TKey key, TSource source)
        {
            var entry = await ConvertToEntry(source);
            Update(key, entry);
        }

        /// <summary>
        /// Creates or updates the entry with the given ID in the database for the source object as needed.
        /// </summary>
        protected async Task<TEntry> UpsertEntry(TSource source, bool replace = false)
        {
            var entry = await ConvertToEntry(source);
            var existingEntry = Get(entry.Key);
            if (existingEntry != null)
            {
                if (replace)
                {
                    Update(entry.Key, entry);
                    return entry;
                }

                return existingEntry;
            }

            return Create(entry);
        }

        /// <summary>
        /// Returns an entry for the given source object.
        /// </summary>
        protected abstract Task<TEntry> ConvertToEntry(TSource pokemon);

        /// <summary>
        /// Returns whether the entry is considered stale.
        /// </summary>
        protected bool IsStale(TEntry entry)
        {
            return entry.CreationTime < DateTime.UtcNow - TimeToLive;
        }
    }
}
