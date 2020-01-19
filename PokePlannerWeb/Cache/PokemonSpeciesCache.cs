using System.Collections.Generic;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for a cache of Pokemon species information.
    /// </summary>
    public class PokemonSpeciesCache : Cache<PokemonSpeciesCacheEntry> { }

    /// <summary>
    /// Cache entry representing a Pokemon species.
    /// </summary>
    public class PokemonSpeciesCacheEntry : CacheEntry
    {
        /// <summary>
        /// The display names for the Pokemon species.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// The varieties of the Pokemon species.
        /// </summary>
        public List<PokemonVarietyCacheEntry> Varieties { get; set; }
    }

    /// <summary>
    /// Cache entry representing a Pokemon as a variety of a given Pokemon.
    /// </summary>
    public class PokemonVarietyCacheEntry : CacheEntry
    {
        /// <summary>
        /// The display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }

    /// <summary>
    /// Class for a display name.
    /// </summary>
    public class DisplayName
    {
        /// <summary>
        /// The language of the display name.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// The display name.
        /// </summary>
        public string Name { get; set; }
    }
}
