using System.Linq;
using System.Text.RegularExpressions;
using MongoDB.Bson.Serialization.Conventions;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using Environment = System.Environment;

namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Factory for data store sources.
    /// </summary>
    public class DataStoreSourceFactory
    {
        /// <summary>
        /// Types whose fields should not be serialised if they have default values assigned.
        /// </summary>
        private static readonly System.Type[] IgnoreDefaultValuesTypes =
        {
            typeof(Generation),
            typeof(Pokedex),
            typeof(Pokemon),
            typeof(PokemonForm),
            typeof(Type),
            typeof(Version),
            typeof(VersionGroup)
        };

        /// <summary>
        /// The connection string to the database instance.
        /// </summary>
        private readonly string ConnectionString = Environment.GetEnvironmentVariable(
            "PokePlannerWebConnectionString", System.EnvironmentVariableTarget.Machine);

        /// <summary>
        /// The private key of the database.
        /// </summary>
        private readonly string PrivateKey = Environment.GetEnvironmentVariable(
            "PokePlannerWebPrivateKey", System.EnvironmentVariableTarget.Machine);

        /// <summary>
        /// The name of the database.
        /// </summary>
        private readonly string DatabaseName = "PokePlannerWebDataStore";

        /// <summary>
        /// Creates an entry source for the given entry type.
        /// </summary>
        public IDataStoreSource<TEntry> Create<TEntry>(string collectionName) where TEntry : EntryBase
        {
            var isCosmosDb = Regex.IsMatch(ConnectionString, @"https:\/\/[\w-]+\.documents\.azure\.com");
            if (isCosmosDb)
            {
                return new CosmosDbDataStoreSource<TEntry>(ConnectionString, PrivateKey, DatabaseName, collectionName);
            }

            ConfigureMongoDb();
            return new MongoDbDataStoreSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }

        /// <summary>
        /// Configures settings for Mongo DB.
        /// </summary>
        private void ConfigureMongoDb()
        {
            // ignore null values of certain types
            ConventionRegistry.Register(
                "IgnoreIfDefault",
                new ConventionPack
                {
                    new IgnoreIfDefaultConvention(true)
                },
                t => IgnoreDefaultValuesTypes.Contains(t)
            );

            // ignore extra values for all types
            ConventionRegistry.Register(
                "IgnoreExtra",
                new ConventionPack
                {
                    new IgnoreExtraElementsConvention(true)
                },
                t => true
            );
        }
    }
}
