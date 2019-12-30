using System.Collections.Generic;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for a cache of Pokemon information.
    /// </summary>
    public class PokemonCache : Cache<PokemonCacheEntry> { }

    /// <summary>
    /// Cache entry representing a Pokemon.
    /// </summary>
    public class PokemonCacheEntry : CacheEntry
    {
        /// <summary>
        /// The display names for the Pokemon.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// The forms of the Pokemon.
        /// </summary>
        public List<PokemonFormCacheEntry> Forms { get; set; }
    }

    /// <summary>
    /// Cache entry representing a Pokemon form.
    /// </summary>
    public class PokemonFormCacheEntry : CacheEntry
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
