﻿using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon in the data store.
    /// </summary>
    public class PokemonEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the Pokemon.
        /// </summary>
        public int PokemonId => Key;

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
    }
}
