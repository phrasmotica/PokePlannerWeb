using System;
using System.Text.RegularExpressions;
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
        /// The private key of the database.
        /// </summary>
        private readonly string PrivateKey = Environment.GetEnvironmentVariable(
            "PokePlannerWebPrivateKey", EnvironmentVariableTarget.Machine);

        /// <summary>
        /// The name of the database.
        /// </summary>
        private readonly string DatabaseName = "PokePlannerWebCache";

        /// <summary>
        /// Creates a cache source for the given named API resource type.
        /// </summary>
        public ICacheSource<TEntry> Create<TEntry>(string collectionName) where TEntry : NamedApiResource
        {
            var isCosmosDb = Regex.IsMatch(ConnectionString, @"https:\/\/[\w-]+\.documents\.azure\.com");
            if (isCosmosDb)
            {
                return new CosmosDbCacheSource<TEntry>(ConnectionString, PrivateKey, DatabaseName, collectionName);
            }

            return new MongoDbCacheSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
