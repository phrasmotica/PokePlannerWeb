using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Payloads;
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
        /// Returns this Pokemon's types in the current version group.
        /// </summary>
        public static async Task<IEnumerable<Type>> GetTypes(this Pokemon pokemon)
        {
            var versionGroup = PokeApiData.Instance.VersionGroup;
            var types = await pokemon.GetTypes(versionGroup);
            return types;
        }

        /// <summary>
        /// Returns this Pokemon's types in the given version group.
        /// </summary>
        private static async Task<IEnumerable<Type>> GetTypes(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var generation = await PokeApiData.Instance.Get(versionGroup.Generation);
            var pastTypes = await pokemon.GetPastTypes(generation);
            return pastTypes.Any() ? pastTypes : pokemon.GetCurrentTypes();
        }

        /// <summary>
        /// Returns this Pokemon's type data for the given generation, if any.
        /// </summary>
        private static async Task<IEnumerable<Type>> GetPastTypes(this Pokemon pokemon, Generation generation)
        {
            var pastTypes = pokemon.PastTypes;
            var pastTypeGenerations = await PokeApiData.Instance.Get(pastTypes.Select(t => t.Generation));

            if (pastTypeGenerations.Any())
            {
                // use the earliest generation after the given one with past type data, if it exists
                var laterGens = pastTypeGenerations.Where(g => g.Id >= generation.Id).ToList();
                if (laterGens.Any())
                {
                    var genToUse = laterGens.Aggregate((g, h) => g.Id < h.Id ? g : h);
                    return pastTypes.Single(p => p.Generation.Name == genToUse.Name)
                                    .Types
                                    .ToTypes();
                }
            }

            return Enumerable.Empty<Type>();
        }

        /// <summary>
        /// Returns this Pokemon's type efficacy as an array.
        /// </summary>
        public static async Task<double[]> GetTypeEfficacyArr(this Pokemon pokemon)
        {
            var types = await pokemon.GetTypes();
            return TypeData.Instance.GetEfficacyArr(types);
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
