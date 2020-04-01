using System;
using System.Collections.Generic;
using System.Linq.Expressions;
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
        public IEnumerable<TEntry> GetAll()
        {
            return Collection.Find(_ => true).ToEnumerable();
        }

        /// <summary>
        /// Returns the first entry that matches the given predicate.
        /// </summary>
        public TEntry GetOne(Expression<Func<TEntry, bool>> predicate)
        {
            return Collection.Find(predicate).FirstOrDefault();
        }

        /// <summary>
        /// Creates the given entry and returns it.
        /// </summary>
        public TEntry Create(TEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Deletes the first entry that matches the given predicate.
        /// </summary>
        public void DeleteOne(Expression<Func<TEntry, bool>> predicate)
        {
            Collection.DeleteOne(predicate);
        }
    }
}
