using System.Collections.Generic;
using System.Linq;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore;
using Type = PokePlannerWeb.Data.Types.Type;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extensions methods for other PokeAPI types.
    /// </summary>
    public static class PokeAPIExtensions
    {
        /// <summary>
        /// Returns the name from the given list of names in the given locale.
        /// </summary>
        public static string GetName(this List<Names> names, string locale = "en")
        {
            return names?.FirstOrDefault(n => n.Language.Name == locale)?.Name;
        }

        /// <summary>
        /// Returns this type map as an array of Type enum values.
        /// </summary>
        public static IEnumerable<Type> ToTypes(this IEnumerable<PokemonType> typeMap)
        {
            return typeMap.ToNames().Select(name => name.ToEnum<Type>());
        }

        /// <summary>
        /// Returns this type map as an array of Type enum values.
        /// </summary>
        public static IEnumerable<string> ToNames(this IEnumerable<PokemonType> typeMap)
        {
            return typeMap.OrderBy(t => t.Slot).Select(t => t.Type.Name);
        }

        /// <summary>
        /// Returns this collection of names as a collection of DisplayNames.
        /// </summary>
        public static IEnumerable<DisplayName> ToDisplayNames(this IEnumerable<Names> names)
        {
            return names.Select(n => new DisplayName { Language = n.Language.Name, Name = n.Name });
        }
    }
}
