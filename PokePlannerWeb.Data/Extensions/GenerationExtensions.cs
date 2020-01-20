using System.Threading.Tasks;
using PokeApiNet;
using Type = PokePlannerWeb.Data.Types.Type;

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
            var typeObj = await PokeAPI.Get<PokeApiNet.Type>(type.ToString().ToLower());
            var generationIntroduced = await PokeAPI.Get(typeObj.Generation);
            return generationIntroduced.Id <= generation.Id;
        }
    }
}
