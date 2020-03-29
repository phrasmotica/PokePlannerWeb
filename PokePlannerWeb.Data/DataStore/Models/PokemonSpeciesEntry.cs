﻿using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon species in the data store.
    /// </summary>
    public class PokemonSpeciesEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon species.
        /// </summary>
        public int SpeciesId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets this Pokemon species's display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the Pokemon this species represents.
        /// </summary>
        public List<Pokemon> Varieties { get; set; }
    }
}
