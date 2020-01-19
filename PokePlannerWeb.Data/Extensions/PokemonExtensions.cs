using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.DataStore;
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
        #region Forms

        /// <summary>
        /// Returns the IDs of the forms of the given Pokemon in the version group with the given ID.
        /// </summary>
        public static async Task<int[]> GetFormIDs(this Pokemon pokemon, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await pokemon.GetFormIDs(versionGroup);
        }

        /// <summary>
        /// Returns the IDs of the forms of the given Pokemon in the given version group.
        /// </summary>
        private static async Task<int[]> GetFormIDs(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var forms = await PokeAPI.Get(pokemon.Forms);
            return forms.Select(f => f.Id).ToArray();
        }

        /// <summary>
        /// Returns the names of the forms of the given Pokemon in the version group with the given ID.
        /// </summary>
        public static async Task<string[]> GetFormNames(this Pokemon pokemon, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await pokemon.GetFormNames(versionGroup);
        }

        /// <summary>
        /// Returns the names of the forms of the given Pokemon in the given version group.
        /// </summary>
        private static async Task<string[]> GetFormNames(this Pokemon pokemon, VersionGroup versionGroup)
        {
            var forms = await PokeAPI.Get(pokemon.Forms);
            return forms.Select(f => f.GetEnglishName()).ToArray();
        }

        #endregion

        #region Species varieties

        /// <summary>
        /// Returns the IDs of the varieties of the given species in the given version group.
        /// </summary>
        public static async Task<int[]> GetVarietyIDs(this PokemonSpecies species, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await species.GetVarietyIDs(versionGroup);
        }

        /// <summary>
        /// Returns the IDs of the varieties of the given species in the given version group.
        /// </summary>
        private static async Task<int[]> GetVarietyIDs(this PokemonSpecies species, VersionGroup versionGroup)
        {
            var varieties = species.Varieties;
            var varietiesCount = varieties.Count;

            var ids = new int[varietiesCount];
            for (int i = 0; i < varietiesCount; i++)
            {
                var variety = await PokeAPI.Get(varieties[i].Pokemon);
                ids[i] = variety.Id;
            }

            return ids;
        }

        /// <summary>
        /// Returns the names of the varieties of the given species in the version group with the
        /// given ID.
        /// </summary>
        public static async Task<string[]> GetVarietyNames(this PokemonSpecies species, int? versionGroupId = null)
        {
            versionGroupId ??= VersionGroupData.Instance.VersionGroupIndex;
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId.Value];
            return await species.GetVarietyNames(versionGroup);
        }

        /// <summary>
        /// Returns the names of the varieties of the given species in the given version group.
        /// </summary>
        private static async Task<string[]> GetVarietyNames(this PokemonSpecies species, VersionGroup versionGroup)
        {
            var varieties = await PokeAPI.Get(species.Varieties.Select(v => v.Pokemon));
            return varieties.Select(v => v.Name).ToArray();
        }

        #endregion

        #region Types

        /// <summary>
        /// Returns this Pokemon's latest type data.
        /// </summary>
        public static IEnumerable<Type> GetCurrentTypes(this Pokemon pokemon)
        {
            return pokemon.Types.ToTypes();
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

        #endregion

        /// <summary>
        /// Returns this Pokemon's display names.
        /// </summary>
        public static async Task<IEnumerable<DisplayName>> GetDisplayNames(this Pokemon pokemon)
        {
            var form = await PokeAPI.Get(pokemon.Forms[0]);
            if (string.IsNullOrEmpty(form.FormName))
            {
                // form has empty form_name if it's the standard form
                var species = await PokeAPI.Get(pokemon.Species);
                return species.Names.ToDisplayNames().ToList();
            }

            // use names of secondary form
            return form.Names.ToDisplayNames().ToList();
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
            var form = await PokeAPI.Get(pokemon.Forms[0]);
            if (form.IsMega)
            {
                // decide based on version group in which it was introduced
                var formVersionGroup = await PokeAPI.Get(form.VersionGroup);
                return formVersionGroup.Order <= versionGroup.Order;
            }

            var pokemonSpecies = await PokeAPI.Get(pokemon.Species);
            return pokemonSpecies.IsValid(versionGroup);
        }

        /// <summary>
        /// Returns true if this Pokemon can be obtained in the given version group.
        /// </summary>
        private static bool IsValid(this PokemonSpecies pokemonSpecies, VersionGroup versionGroup)
        {
            if (!versionGroup.Pokedexes.Any() || !pokemonSpecies.PokedexNumbers.Any())
            {
                // PokeAPI data is incomplete
                return true;
            }

            var versionGroupPokedexes = versionGroup.Pokedexes.Select(p => p.Name);
            var pokemonPokedexes = pokemonSpecies.PokedexNumbers.Select(pn => pn.Pokedex.Name);
            return versionGroupPokedexes.Intersect(pokemonPokedexes).Any();
        }

        /// <summary>
        /// Returns this Pokemon's base stats in the version group with the given ID.
        /// </summary>
        public static int[] GetBaseStats(this Pokemon pokemon, int versionGroupId)
        {
            return pokemon.Stats.Select(bs => bs.BaseStat).ToArray();
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
