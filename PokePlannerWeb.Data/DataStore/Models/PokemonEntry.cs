using System.Collections.Generic;
using System.Linq;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon in the data store.
    /// </summary>
    public class PokemonEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon.
        /// </summary>
        public int PokemonId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets this Pokemon's display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Returns the name of this Pokemon entry in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Name;
        }
    }
}
