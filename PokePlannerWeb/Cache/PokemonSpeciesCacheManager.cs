using System.Linq;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for accessing the Pokemon species cache.
    /// </summary>
    public class PokemonSpeciesCacheManager : CacheManager<PokemonSpeciesCacheEntry>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static PokemonSpeciesCacheManager Instance { get; } = new PokemonSpeciesCacheManager();

        #endregion

        /// <summary>
        /// The JSON cache file.
        /// </summary>
        protected override string CachePath => "Cache\\PokemonSpecies.json";

        /// <summary>
        /// Returns the names of all species for the given locale.
        /// </summary>
        public string[] GetAllSpeciesNames(string locale = "en")
        {
            var cache = ReadCache();
            if (cache.Entries == null)
            {
                return null;
            }

            var cachedNames = cache.Entries.Select(e => e.DisplayNames.Single(dn => dn.Language == locale))
                                           .Select(dn => dn.Name);
            return cachedNames.ToArray();
        }

        /// <summary>
        /// Returns the IDs of the varieties of the species with the given ID.
        /// </summary>
        public int[] GetSpeciesVarietyIds(int speciesId)
        {
            var entry = GetEntry(speciesId);
            if (entry == null)
            {
                return null;
            }

            var cachedIds = entry.Varieties.Select(v => v.Key);
            return cachedIds.ToArray();
        }


        public string[] GetSpeciesVarietyNames(int speciesId, string locale = "en")
        {
            var entry = GetEntry(speciesId);
            if (entry == null)
            {
                return null;
            }

            var cachedNames = entry.Varieties.Select(v => v.DisplayNames.Single(dn => dn.Language == "en"))
                                             .Select(dn => dn.Name);
            return cachedNames.ToArray();
        }
    }
}
