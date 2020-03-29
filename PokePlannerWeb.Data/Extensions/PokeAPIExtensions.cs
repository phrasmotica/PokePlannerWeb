using System.Collections.Generic;
using System.Linq;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extensions methods for other PokeAPI types.
    /// </summary>
    public static class PokeAPIExtensions
    {
        /// <summary>
        /// Returns the display names of this Pokemon form.
        /// </summary>
        public static IEnumerable<DisplayName> GetDisplayNames(this PokemonForm pokemonForm)
        {
            return pokemonForm.Names.ToDisplayNames();
        }

        /// <summary>
        /// Returns the name from the given list of names in the given locale.
        /// </summary>
        public static string GetName(this List<Names> names, string locale = "en")
        {
            return names?.FirstOrDefault(n => n.Language.Name == locale)?.Name;
        }

        /// <summary>
        /// Returns this collection of names as a collection of DisplayNames.
        /// </summary>
        public static IEnumerable<DisplayName> ToDisplayNames(this IEnumerable<Names> names)
        {
            return names.Select(n => new DisplayName { Language = n.Language.Name, Name = n.Name });
        }

        /// <summary>
        /// Returns resources for all the versions spanned by this list of encounters.
        /// </summary>
        public static IEnumerable<NamedApiResource<Version>> GetDistinctVersions(this IEnumerable<LocationAreaEncounter> encounters)
        {
            return encounters.SelectMany(e => e.VersionDetails)
                             .GroupBy(ved => ved.Version)
                             .Select(g => g.First())
                             .Select(ved => ved.Version);
        }
    }
}
