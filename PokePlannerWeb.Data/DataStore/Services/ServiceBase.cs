using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing a collection in the database.
    /// </summary>
    public abstract class ServiceBase<TSource, TEntry>
        where TSource : NamedApiResource
        where TEntry : EntryBase
    {
        /// <summary>
        /// The cache source.
        /// </summary>
        // TODO: try out Azure Cosmos DB!
        protected ICacheSource<TEntry> CacheSource;

        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected IPokeAPI PokeApi;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<ServiceBase<TSource, TEntry>> Logger;

        /// <summary>
        /// Create connection to database and initialise logger.
        /// </summary>
        public ServiceBase(
            ICacheSource<TEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<ServiceBase<TSource, TEntry>> logger)
        {
            CacheSource = cacheSource;
            PokeApi = pokeApi;
            Logger = logger;
        }

        /// <summary>
        /// Gets the time to live for documents in the collection.
        /// </summary>
        protected virtual TimeSpan TimeToLive { get; } = TimeSpan.FromDays(365);

        #region CRUD methods

        /// <summary>
        /// Returns the entry with the given key from the database.
        /// </summary>
        protected TEntry Get(int key)
        {
            return CacheSource.GetOne(t => t.Key == key);
        }

        /// <summary>
        /// Returns all entries from the database.
        /// </summary>
        protected IEnumerable<TEntry> AllEntries => CacheSource.GetAll();

        /// <summary>
        /// Creates a new entry in the database and returns it.
        /// </summary>
        protected TEntry Create(TEntry entry)
        {
            entry.CreationTime = DateTime.UtcNow;
            CacheSource.Create(entry);
            return entry;
        }

        /// <summary>
        /// Removes the entry with the given key and creates a new one in the database.
        /// </summary>
        protected void Update(int key, TEntry entry)
        {
            Remove(key);
            Create(entry);
        }

        /// <summary>
        /// Removes the entry with the given key from the database.
        /// </summary>
        protected void Remove(int key)
        {
            CacheSource.DeleteOne(t => t.Key == key);
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Creates a new entry in the database for the given named API resource and returns it.
        /// </summary>
        public virtual async Task<TEntry> Upsert(NamedApiResource<TSource> res)
        {
            var source = await PokeApi.Get(res);
            return await Upsert(source);
        }

        /// <summary>
        /// Creates new entries in the database for the given named API resources and returns them.
        /// </summary>
        public virtual async Task<IEnumerable<TEntry>> UpsertMany(IEnumerable<NamedApiResource<TSource>> resources)
        {
            var sources = await PokeApi.Get(resources);
            return await UpsertMany(sources);
        }

        /// <summary>
        /// Returns the entry with the given ID from the database, creating the entry if it doesn't exist.
        /// </summary>
        public async Task<TEntry> Upsert(int key)
        {
            var entry = Get(key);
            if (entry == null)
            {
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"Creating {entryType} entry for {sourceType} {key} in database...");

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
        /// Returns the entry with the given ID from the database, creating the entry if it doesn't exist.
        /// </summary>
        public async Task<IEnumerable<TEntry>> UpsertMany(IEnumerable<int> keys)
        {
            var entries = new List<TEntry>();

            foreach (var key in keys)
            {
                var entry = await Upsert(key);
                entries.Add(entry);
            }

            return entries;
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
        public async Task<IEnumerable<TEntry>> UpsertMany(NamedApiResourceList<TSource> resources, bool replace = false)
        {
            var sourceType = typeof(TSource).Name;
            var entryType = typeof(TEntry).Name;
            Logger.LogInformation($"Upserting {resources.Results.Count} {entryType} entries for {sourceType} in database...");

            var sourceList = await PokeApi.Get(resources.Results);

            var entryList = new List<TEntry>();
            foreach (var o in sourceList)
            {
                var entry = await Upsert(o, replace);
                entryList.Add(entry);
            }

            return entryList;
        }

        /// <summary>
        /// Creates or updates the entry with the given ID in the database for the source object as needed.
        /// </summary>
        public virtual async Task<IEnumerable<TEntry>> UpsertMany(IEnumerable<TSource> sources, bool replace = false)
        {
            var entries = new List<TEntry>();

            foreach (var source in sources)
            {
                var entry = await ConvertToEntry(source);
                var existingEntry = Get(entry.Key);
                if (existingEntry != null)
                {
                    if (replace)
                    {
                        Update(entry.Key, entry);
                        entries.Add(entry);
                    }
                    else
                    {
                        entries.Add(existingEntry);
                    }
                }
                else
                {
                    entries.Add(Create(entry));
                }
            }

            return entries;
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the entries with the given keys from the database.
        /// </summary>
        protected IEnumerable<TEntry> GetMany(IEnumerable<int> keys)
        {
            return AllEntries.Where(e => keys.Contains(e.Key));
        }

        /// <summary>
        /// Fetches the source object with the given ID and creates an entry for it.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndCreateEntry(int key)
        {
            // fetch source
            var source = await FetchSource(key);

            // create entry
            return await CreateEntry(source);
        }

        /// <summary>
        /// Fetches the source object with the given ID, updates the entry for it and returns the entry.
        /// </summary>
        protected async Task<TEntry> FetchSourceAndUpdateEntry(int key)
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
        protected abstract Task<TSource> FetchSource(int key);

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
        protected async Task UpdateEntry(int key, TSource source)
        {
            var entry = await ConvertToEntry(source);
            Update(key, entry);
        }

        /// <summary>
        /// Creates or updates the entry with the given ID in the database for the source object as needed.
        /// </summary>
        protected virtual async Task<TEntry> Upsert(TSource source, bool replace = false)
        {
            // TODO: reduce number of calls to Upsert methods.
            // this method of upserting by key requires (expensive) entry conversions
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
        protected abstract Task<TEntry> ConvertToEntry(TSource source);

        /// <summary>
        /// Returns whether the entry is considered stale.
        /// </summary>
        protected bool IsStale(TEntry entry)
        {
            return entry.CreationTime < DateTime.UtcNow - TimeToLive;
        }

        #endregion
    }
}
