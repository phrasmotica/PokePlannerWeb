using System.Linq;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for accessing the Pokemon cache.
    /// </summary>
    public class PokemonCacheManager : CacheManager<PokemonCacheEntry>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static PokemonCacheManager Instance { get; } = new PokemonCacheManager();

        #endregion

        /// <summary>
        /// The JSON cache file.
        /// </summary>
        protected override string CachePath => "Cache\\Pokemon.json";

        /// <summary>
        /// Returns the display name of the Pokemon with the given ID for the given locale.
        /// </summary>
        public string GetPokemonDisplayName(int pokemonId, string locale = "en")
        {
            var entry = GetEntry(pokemonId);
            if (entry == null)
            {
                return null;
            }

            return entry.DisplayNames.Single(dn => dn.Language == locale).Name;
        }

        /// <summary>
        /// Returns the IDs of the forms of the Pokemon with the given ID.
        /// </summary>
        public int[] GetPokemonFormIds(int pokemonId)
        {
            var entry = GetEntry(pokemonId);
            if (entry == null)
            {
                return null;
            }

            return entry.Forms.Select(v => v.Key).ToArray();
        }

        /// <summary>
        /// Returns the names of the forms of the Pokemon with the given ID for the given locale.
        /// </summary>
        public string[] GetPokemonFormNames(int pokemonId, string locale = "en")
        {
            var entry = GetEntry(pokemonId);
            if (entry == null)
            {
                return null;
            }

            var cachedNames = entry.Forms.Select(v => v.DisplayNames.Single(dn => dn.Language == locale))
                                         .Select(dn => dn.Name);
            return cachedNames.ToArray();
        }
    }
}
