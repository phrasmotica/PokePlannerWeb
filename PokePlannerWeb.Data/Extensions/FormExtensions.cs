using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet;
using PokePlannerWeb.Data.Types;
using Type = PokePlannerWeb.Data.Types.Type;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for the PokeAPI PokemonForm type.
    /// </summary>
    public static class FormExtensions
    {
        #region Types

        /// <summary>
        /// Returns this Pokemon form's types in the version group with the given ID.
        /// </summary>
        public static async Task<IEnumerable<Type>> GetTypes(this PokemonForm form, int? versionGroupId = null)
        {
            // some forms have different types indicated by their names, i.e. arceus, silvally
            var typeNames = TypeData.AllTypes.Select(n => n.ToString().ToLower());
            if (typeNames.Contains(form.FormName))
            {
                return new[] { form.FormName.ToEnum<Type>() };
            }

            // else get types from underlying Pokemon
            var pokemon = await PokeAPI.Get(form.Pokemon);
            return await pokemon.GetTypes(versionGroupId);
        }

        #endregion
    }
}
