using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a evolution chain in the data store.
    /// </summary>
    public class EvolutionChainEntry : EntryBase
    {
        /// <summary>
        /// Gets the ID of the evolution chain.
        /// </summary>
        public int EvolutionChainId => Key;

        /// <summary>
        /// Gets or sets the evolution chain link.
        /// </summary>
        public ChainLinkEntry Chain { get; set; }
    }

    /// <summary>
    /// Represents a link to a species as part of an evolution chain.
    /// </summary>
    public class ChainLinkEntry
    {
        /// <summary>
        /// Whether or not this link is for a baby Pokemon. This would only ever be true on the base link.
        /// </summary>
        public bool IsBaby { get; set; }

        /// <summary>
        /// The Pokemon species at this stage of the evolution chain.
        /// </summary>
        public PokemonSpecies Species { get; set; }

        /// <summary>
        /// All details regarding the specific details of the referenced species evolution.
        /// </summary>
        public List<EvolutionDetailEntry> EvolutionDetails { get; set; }

        /// <summary>
        /// A list of chain objects.
        /// </summary>
        public List<ChainLinkEntry> EvolvesTo { get; set; }
    }

    /// <summary>
    /// Represents details of how a species evolves into another.
    /// </summary>
    public class EvolutionDetailEntry
    {

    }
}
