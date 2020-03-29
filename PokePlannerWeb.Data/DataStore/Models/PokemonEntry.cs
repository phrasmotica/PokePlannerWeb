using System.Collections.Generic;
using PokeApiNet;

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
        /// Gets or sets the name of the Pokemon.
        /// </summary>
        public string Name { get; set; }

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
        /// Gets or sets this Pokemon's forms.
        /// </summary>
        public List<PokemonForm> Forms { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's types indexed by version group ID.
        /// </summary>
        public List<WithId<Type[]>> Types { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's base stats indexed by version group ID.
        /// </summary>
        public List<WithId<int[]>> BaseStats { get; set; }

        /// <summary>
        /// Gets or sets the IDs of the version groups where this Pokemon is valid.
        /// </summary>
        public List<int> Validity { get; set; }
    }
}
