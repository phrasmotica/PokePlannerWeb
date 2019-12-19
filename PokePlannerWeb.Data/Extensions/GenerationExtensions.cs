using System.Threading.Tasks;
using PokeApiNet.Models;
using Type = PokePlannerWeb.Data.Mechanics.Type;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for the PokeAPI Generation type.
    /// </summary>
    public static class GenerationExtensions
    {
        /// <summary>
        /// Returns true if this generation uses the given type.
        /// </summary>
        public static async Task<bool> HasType(this Generation generation, Type type)
        {
            var typeObj = await PokeAPI.Get<PokeApiNet.Models.Type>(type.ToString().ToLower());
            var generationIntroduced = await PokeAPI.Get(typeObj.Generation);
            return generationIntroduced.Id <= generation.Id;
        }
    }
}
