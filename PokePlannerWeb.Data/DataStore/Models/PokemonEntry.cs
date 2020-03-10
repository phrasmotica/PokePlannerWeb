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
        /// Gets or sets this Pokemon's front default sprite URL.
        /// </summary>
        public string SpriteUrl { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's front shiny sprite URL.
        /// </summary>
        public string ShinySpriteUrl { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's types indexed by version group index.
        /// </summary>
        public List<string[]> Types { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's base stats indexed by version group index.
        /// </summary>
        public List<int[]> BaseStats { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's validity indexed by version group index.
        /// </summary>
        public List<bool> Validity { get; set; }

        /// <summary>
        /// Returns the name of this Pokemon entry in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Name;
        }

        /// <summary>
        /// Returns this Pokemon entry's types in the version group with the given ID.
        /// </summary>
        public string[] GetTypes(int versionGroupId)
        {
            return Types[versionGroupId - 1];
        }

        /// <summary>
        /// Returns this Pokemon entry's types in the version group with the given ID.
        /// </summary>
        public int[] GetBaseStats(int versionGroupId)
        {
            return BaseStats[versionGroupId - 1];
        }

        /// <summary>
        /// Returns this Pokemon entry's validity in the version group with the given ID.
        /// </summary>
        public bool GetValidity(int versionGroupId)
        {
            return Validity[versionGroupId - 1];
        }
    }
}
