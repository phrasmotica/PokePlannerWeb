using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Clients
{
    public class MongoDbCacheClientFactory : ICacheClientFactory
    {
        /// <summary>
        /// The database in Mongo DB.
        /// </summary>
        protected readonly IMongoDatabase Database;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MongoDbCacheClientFactory(IMongoClient client, string databaseName)
        {
            Database = client.GetDatabase(databaseName);
        }

        /// <summary>
        /// Creates a Mongo DB cache client.
        /// </summary>
        public ICacheClient<TKey, TEntry> Create<TKey, TEntry>(string collectionName) where TEntry : EntryBase<TKey>
        {
            return new MongoDbCacheClient<TKey, TEntry>(Database, collectionName);
        }
    }
}
