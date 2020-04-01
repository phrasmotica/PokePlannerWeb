using System.Linq;
using MongoDB.Bson.Serialization.Conventions;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Factory for cache sources.
    /// </summary>
    public class CacheSourceFactory
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
        public CacheSourceFactory(string connectionString, string databaseName)
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
        /// Creates a cache source for the given entry type.
        /// </summary>
        public ICacheSource<TEntry> Create<TEntry>(string collectionName)
        {
            return new MongoDbCacheSource<TEntry>(ConnectionString, DatabaseName, collectionName);
        }
    }
}
