﻿using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a pokedex in the data store.
    /// </summary>
    public class PokedexEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the pokedex.
        /// </summary>
        public int PokedexId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the pokedex.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the display names of the pokedex.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}