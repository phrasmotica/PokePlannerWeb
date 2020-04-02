using System.Linq;
using MongoDB.Bson.Serialization.Conventions;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;

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
        private readonly string ConnectionString;

        /// <summary>
        /// The name of the database.
        /// </summary>
        private readonly string DatabaseName;

        /// <summary>
        /// Constructor.
        /// </summary>
        public DataStoreSourceFactory(string connectionString, string databaseName)
        {
            ConnectionString = connectionString;
            DatabaseName = databaseName;

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

        /// <summary>
        /// Creates an entry source for the given entry type.
        /// </summary>
        public IDataStoreSource<TEntry> Create<TEntry>(string collectionName) where TEntry : EntryBase
        {
            return new MongoDbDataStoreSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
