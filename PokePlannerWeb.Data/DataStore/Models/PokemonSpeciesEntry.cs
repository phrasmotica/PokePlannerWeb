using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon species in the data store.
    /// </summary>
    public class PokemonSpeciesEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the Pokemon species.
        /// </summary>
        public int SpeciesId => Key;

        /// <summary>
        /// Gets or sets this Pokemon species' display names.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the Pokemon this species represents.
        /// </summary>
        public List<Pokemon> Varieties { get; set; }

        /// <summary>
        /// Gets or sets the generation in which this species was introduced.
        /// </summary>
        public Generation Generation { get; set; }

        /// <summary>
        /// Gets or sets the species' evolution chain.
        /// </summary>
        public EvolutionChain EvolutionChain { get; set; }

        /// <summary>
        /// Gets or sets the IDs of the version groups where this Pokemon species is valid.
        /// </summary>
        public List<int> Validity { get; set; }
    }
}
