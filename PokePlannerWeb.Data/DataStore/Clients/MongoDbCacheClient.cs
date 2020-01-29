using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Clients
{
    /// <summary>
    /// Class for connecting to a Mongo DB collection.
    /// </summary>
    public class MongoDbCacheClient<TKey, TEntry> : ICacheClient<TKey, TEntry> where TEntry : EntryBase<TKey>
    {
        /// <summary>
        /// The name of the collection in Mongo DB.
        /// </summary>
        private readonly IMongoCollection<TEntry> Collection;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MongoDbCacheClient(IMongoDatabase database, string collectionName)
        {
            Collection = database.GetCollection<TEntry>(collectionName);
        }

        public virtual TEntry Get(TKey key)
        {
            return Collection.Find(e => IsMatch(key, e)).FirstOrDefault();
        }

        public virtual TEntry Create(TEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        public virtual void Remove(TKey key)
        {
            Collection.DeleteOne(e => IsMatch(key, e));
        }

        public virtual void Update(TKey key, TEntry entry)
        {
            Collection.ReplaceOne(e => IsMatch(key, e), entry);
        }

        protected virtual bool IsMatch(TKey key, TEntry entry)
        {
            return entry.Key.Equals(key);
        }
    }
}
