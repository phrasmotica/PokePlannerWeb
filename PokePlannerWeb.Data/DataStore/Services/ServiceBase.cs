﻿using System;
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
        /// Returns all stale entries from the database.
        /// </summary>
        public IEnumerable<TEntry> StaleEntries => AllEntries.Where(IsStale);

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
        /// Returns all entries from the database, creating them if they don't exist.
        /// </summary>
        public async Task<IEnumerable<TEntry>> GetAllOrCreate()
        {
            var resourcesList = await PokeApi.GetFullPage<TSource>();
            
            var allEntries = AllEntries.ToList();
            if (!allEntries.Any() || allEntries.Count != resourcesList.Count)
            {
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"Creating {resourcesList.Count} {entryType} entries for {sourceType} in database...");

                var sourceList = await PokeApi.GetMany<TSource>(resourcesList.Count);

                // create all entries
                var newEntryList = new List<TEntry>();
                foreach (var o in sourceList)
                {
                    var entry = await CreateEntry(o);
                    newEntryList.Add(entry);
                }

                return newEntryList;
            }

            var staleEntries = StaleEntries.ToList();
            if (staleEntries.Any())
            {
                var sourceType = typeof(TSource).Name;
                var entryType = typeof(TEntry).Name;
                Logger.LogInformation($"{staleEntries.Count} {entryType} entries are stale.");

                // update stale entries
                foreach (var entry in staleEntries)
                {
                    var key = entry.Key;
                    Logger.LogInformation($"Updating {entryType} entry for {sourceType} {key} in database...");
                    await FetchSourceAndUpdateEntry(key);
                }

                // use AllEntries property since we've updated some entries
                return AllEntries;
            }

            return allEntries;
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
