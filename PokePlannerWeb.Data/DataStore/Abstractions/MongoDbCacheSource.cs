using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Cache source for Mongo DB.
    /// </summary>
    public class MongoDbCacheSource<TEntry> : ICacheSource<TEntry> where TEntry : EntryBase
    {
        /// <summary>
        /// The collection of entries.
        /// </summary>
        protected IMongoCollection<TEntry> Collection;

        /// <summary>
        /// Create connection to database.
        /// </summary>
        public MongoDbCacheSource(string connectionString, string databaseName, string collectionName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            Collection = database.GetCollection<TEntry>(collectionName);
        }

        /// <summary>
        /// Returns all entries in the cache.
        /// </summary>
        public Task<IEnumerable<TEntry>> GetAll()
        {
            var entries = Collection.Find(_ => true).ToEnumerable();
            return Task.FromResult(entries);
        }

        /// <summary>
        /// Returns the first entry that matches the given predicate.
        /// </summary>
        public Task<TEntry> GetOne(Expression<Func<TEntry, bool>> predicate)
        {
            var entry = Collection.Find(predicate).FirstOrDefault();
            return Task.FromResult(entry);
        }

        /// <summary>
        /// Creates the given entry and returns it.
        /// </summary>
        public Task<TEntry> Create(TEntry entry)
        {
            Collection.InsertOne(entry);
            return Task.FromResult(entry);
        }

        /// <summary>
        /// Deletes the first entry that matches the given predicate.
        /// </summary>
        public Task DeleteOne(Expression<Func<TEntry, bool>> predicate)
        {
            Collection.DeleteOne(predicate);
            return Task.CompletedTask;
        }
    }
}
