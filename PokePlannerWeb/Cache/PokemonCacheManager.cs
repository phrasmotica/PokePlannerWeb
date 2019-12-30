namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for accessing the Pokemon cache.
    /// </summary>
    public class PokemonCacheManager : ICacheManager<PokemonCacheEntry>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static ICacheManager<PokemonCacheEntry> Instance { get; } = new PokemonCacheManager();

        #endregion

        /// <summary>
        /// The JSON cache file.
        /// </summary>
        public string CachePath => "Cache\\Pokemon.json";
    }
}
