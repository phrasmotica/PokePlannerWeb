using PokeApiNet;

namespace PokePlannerWeb.Data.Cache.Abstractions
{
    /// <summary>
    /// Factory for data store sources.
    /// </summary>
    public class CacheSourceFactory
    {
        /// <summary>
        /// The connection string to the database instance.
        /// </summary>
        private readonly string ConnectionString;

        /// <summary>
        /// The name of the database.
        /// </summary>
        private readonly string DatabaseName;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CacheSourceFactory(string connectionString, string databaseName)
        {
            ConnectionString = connectionString;
            DatabaseName = databaseName;
        }

        /// <summary>
        /// Creates a cache source for the given named API resource type.
        /// </summary>
        public ICacheSource<TEntry> Create<TEntry>(string collectionName) where TEntry : NamedApiResource
        {
            return new MongoDbCacheSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
