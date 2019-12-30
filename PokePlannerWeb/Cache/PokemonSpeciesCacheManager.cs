namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for accessing the Pokemon species cache.
    /// </summary>
    public class PokemonSpeciesCacheManager : ICacheManager<PokemonSpeciesCacheEntry>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static ICacheManager<PokemonSpeciesCacheEntry> Instance { get; } = new PokemonSpeciesCacheManager();

        #endregion

        /// <summary>
        /// The JSON cache file.
        /// </summary>
        public string CachePath => "Cache\\PokemonSpecies.json";
    }
}
