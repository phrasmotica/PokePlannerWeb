using System.Collections.Generic;
using System.Linq;
using PokeApiNet.Models;
using Type = PokePlannerWeb.Data.Mechanics.Type;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extensions methods for other PokeAPI types.
    /// </summary>
    public static class PokeAPIExtensions
    {
        /// <summary>
        /// Returns this type map as an array of Type enum values.
        /// </summary>
        public static IEnumerable<Type> ToTypes(this IEnumerable<PokemonType> typeMap)
        {
            return typeMap.OrderBy(t => t.Slot)
                          .Select(t => t.Type.Name.ToEnum<Type>());
        }
    }
}
