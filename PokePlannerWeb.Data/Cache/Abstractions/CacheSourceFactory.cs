using System;
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
        private readonly string ConnectionString = Environment.GetEnvironmentVariable(
            "PokePlannerWebConnectionString", EnvironmentVariableTarget.Machine);

        /// <summary>
        /// The name of the database.
        /// </summary>
        private readonly string DatabaseName = "PokePlannerWebCache";

        /// <summary>
        /// Creates a cache source for the given named API resource type.
        /// </summary>
        public ICacheSource<TEntry> Create<TEntry>(string collectionName) where TEntry : NamedApiResource
        {
            return new MongoDbCacheSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
