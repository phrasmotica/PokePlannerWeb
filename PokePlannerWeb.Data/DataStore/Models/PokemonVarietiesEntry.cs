using System.Collections.Generic;
using System.Linq;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon species mapped to its varieties in the data store.
    /// </summary>
    public class PokemonVarietiesEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the species.
        /// </summary>
        public int SpeciesId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets this species' varieties.
        /// </summary>
        public List<PokemonVariety> Varieties { get; set; }

        /// <summary>
        /// Returns the IDs of this species' varieties.
        /// </summary>
        public IEnumerable<int> GetVarietyIds()
        {
            return Varieties.Select(v => v.PokemonId);
        }

        /// <summary>
        /// Returns the names of this species' varieties in the given locale.
        /// </summary>
        public IEnumerable<string> GetVarietyDisplayNames(string locale = "en")
        {
            return Varieties.SelectMany(v => v.DisplayNames)
                            .Where(n => n.Language == locale)
                            .Select(n => n.Name);
        }
    }

    /// <summary>
    /// Represents a Pokemon variety (a Pokemon in the context of its parent Pokemon species) in the
    /// data store.
    /// </summary>
    public class PokemonVariety
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon.
        /// </summary>
        public int PokemonId { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Returns the name of this Pokemon in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Name;
        }
    }
}
