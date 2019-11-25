﻿using PokeApiNet.Models;
using PokePlannerWeb.Data.Payloads;
using System.Collections.Generic;
using System.Threading.Tasks;
using Type = PokePlannerWeb.Data.Mechanics.Type;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for the PokeAPI Pokemon type.
    /// </summary>
    public static class PokemonExtensions
    {
        /// <summary>
        /// Returns this Pokemon's latest type data.
        /// </summary>
        public static IEnumerable<Type> GetCurrentTypes(this Pokemon pokemon)
        {
            return pokemon.Types.ToTypes();
        }

        /// <summary>
        /// Returns a minimal representation of this Pokemon resource.
        /// </summary>
        public static async Task<PokemonPayload> AsPayload(this Pokemon pokemon)
        {
            return await PokemonPayload.Create(pokemon);
        }
    }
}