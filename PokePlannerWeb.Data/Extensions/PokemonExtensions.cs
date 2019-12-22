using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Payloads;
using PokePlannerWeb.Data.Types;
using Type = PokePlannerWeb.Data.Types.Type;

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
        /// Returns a description of the Pokemon's types in the version group with the given ID.
        /// </summary>
        public static async Task<string> GetTypesDescription(this Pokemon pokemon, int versionGroupId)
        {
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId];
            return await pokemon.GetTypesDescription(versionGroup);
        }

        /// <summary>
        /// Returns a description of the Pokemon's types in the given version group.
        /// </summary>
        private static async Task<string> GetTypesDescription(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var types = await pokemon.GetTypes(versionGroup);
            return string.Join(" / ", types.Select(t => t.ToString()));
        }

        /// <summary>
        /// Returns this Pokemon's types in the version group with the given ID.
        /// </summary>
        public static async Task<IEnumerable<Type>> GetTypes(this Pokemon pokemon, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await pokemon.GetTypes(versionGroup);
        }

        /// <summary>
        /// Returns this Pokemon's types in the given version group.
        /// </summary>
        private static async Task<IEnumerable<Type>> GetTypes(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var generation = await PokeAPI.Get(versionGroup.Generation);
            var pastTypes = await pokemon.GetPastTypes(generation);
            return pastTypes.Any() ? pastTypes : pokemon.GetCurrentTypes();
        }

        /// <summary>
        /// Returns this Pokemon's type data for the given generation, if any.
        /// </summary>
        private static async Task<IEnumerable<Type>> GetPastTypes(this Pokemon pokemon, Generation generation)
        {
            var pastTypes = pokemon.PastTypes;
            var pastTypeGenerations = await PokeAPI.Get(pastTypes.Select(t => t.Generation));

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
        /// Returns this Pokemon's type efficacy in the version group with the given ID as an array.
        /// </summary>
        public static async Task<double[]> GetTypeEfficacyArr(this Pokemon pokemon, int versionGroupId)
        {
            var types = await pokemon.GetTypes(versionGroupId);
            return TypeData.Instance.GetEfficacyArr(types);
        }

        /// <summary>
        /// Returns true if this Pokemon can be obtained in the version group with the given ID.
        /// </summary>
        public static async Task<bool> IsValid(this Pokemon pokemon, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await pokemon.IsValid(versionGroup);
        }

        /// <summary>
        /// Returns true if this Pokemon can be obtained in the given version group.
        /// </summary>
        private static async Task<bool> IsValid(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var pokemonSpecies = await PokeAPI.Get(pokemon.Species);
            return pokemonSpecies.IsValid(versionGroup);
        }

        /// <summary>
        /// Returns true if this Pokemon can be obtained in the given version group.
        /// </summary>
        private static bool IsValid(this PokemonSpecies pokemonSpecies, VersionGroup versionGroup)
        {
            var versionGroupPokedexes = versionGroup.Pokedexes.Select(p => p.Name);
            var pokemonPokedexes = pokemonSpecies.PokedexNumbers.Select(pn => pn.Pokedex.Name);
            return versionGroupPokedexes.Intersect(pokemonPokedexes).Any();
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
