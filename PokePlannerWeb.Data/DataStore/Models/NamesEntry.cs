using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Class for database entries containing a list of names in a single locale.
    /// </summary>
    public class NamesEntry : EntryBase
    {
        /// <summary>
        /// Gets or sets the key identifying the resource that these names are for.
        /// </summary>
        public string ResourceKey { get; set; }

        /// <summary>
        /// Gets or sets the locale of the names in the entry.
        /// </summary>
        public string Locale { get; set; }

        /// <summary>
        /// Gets or sets the list of names.
        /// </summary>
        public List<string> DisplayNames { get; set; }
    }
}
