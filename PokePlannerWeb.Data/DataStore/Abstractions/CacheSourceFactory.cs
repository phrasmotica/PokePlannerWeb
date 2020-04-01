namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Factory for cache sources.
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
            => (ConnectionString, DatabaseName) = (connectionString, databaseName);

        /// <summary>
        /// Creates a cache source for the given entry type.
        /// </summary>
        public ICacheSource<TEntry> Create<TEntry>(string collectionName)
        {
            return new MongoDbCacheSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
