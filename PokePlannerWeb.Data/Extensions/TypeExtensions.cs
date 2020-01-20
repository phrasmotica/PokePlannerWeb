using PokeApiNet;
using PokePlannerWeb.Data.Payloads;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for the PokeAPI Type type.
    /// </summary>
    public static class TypeExtensions
    {
        /// <summary>
        /// Returns a minimal representation of this Type resource.
        /// </summary>
        public static ResourcePayload<Type> AsPayload(this Type type)
        {
            return new ResourcePayload<Type>(type);
        }
    }
}
