using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Clients
{
    /// <summary>
    /// Factory class for creating clients for the cache.
    /// </summary>
    public class CacheClientFactoryFactory
    {
        /// <summary>
        /// The Mongo DB client.
        /// </summary>
        private readonly IMongoClient MongoClient;

        /// <summary>
        /// The name of the database in Mongo DB.
        /// </summary>
        private readonly string MongoDatabaseName;

        /// <summary>
        /// Load database settings and create possible clients.
        /// </summary>
        public CacheClientFactoryFactory(IPokePlannerWebDbSettings settings)
        {
            var connectionString = settings.ConnectionString;
            MongoClient = new MongoClient(connectionString);
            MongoDatabaseName = settings.DatabaseName;
        }

        /// <summary>
        /// Creates a cache client factory.
        /// </summary>
        public ICacheClientFactory Create()
        {
            // only use Mongo DB for caching at the moment
            return new MongoDbCacheClientFactory(MongoClient, MongoDatabaseName);
        }
    }
}
