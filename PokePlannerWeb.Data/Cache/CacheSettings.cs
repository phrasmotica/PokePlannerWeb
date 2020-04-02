namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Class for PokePlannerWeb cache settings.
    /// </summary>
    public class CacheSettings : ICacheSettings
    {
        /// <summary>
        /// The database connection string.
        /// </summary>
        public string ConnectionString { get; set; }

        /// <summary>
        /// The name of the database.
        /// </summary>
        public string DatabaseName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        public string TypeCollectionName { get; set; }
    }

    /// <summary>
    /// Interface for PokePlannerWeb cache settings.
    /// </summary>
    public interface ICacheSettings
    {
        /// <summary>
        /// The database connection string.
        /// </summary>
        string ConnectionString { get; set; }

        /// <summary>
        /// The name of the database.
        /// </summary>
        string DatabaseName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        string TypeCollectionName { get; set; }
    }
}
