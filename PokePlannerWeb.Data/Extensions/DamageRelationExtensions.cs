using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for querying damage relations between Pokemon types.
    /// </summary>
    public static class DamageRelationExtensions
    {
        /// <summary>
        /// Returns this type's damage relations in the version group with the given ID.
        /// </summary>
        public static async Task<TypeRelations> GetDamageRelations(this PokeApiNet.Models.Type type, int? versionGroupId = null)
        {
            if (!versionGroupId.HasValue)
            {
                return type.DamageRelations;
            }

            var generation = await VersionGroupData.Instance.GetGeneration(versionGroupId.Value);
            var pastDamageRelations = await type.GetPastDamageRelations(generation);
            return pastDamageRelations ?? type.DamageRelations;
        }

        /// <summary>
        /// Returns this type's damage relations data for the given generation, if any.
        /// </summary>
        private static async Task<TypeRelations> GetPastDamageRelations(this PokeApiNet.Models.Type type, Generation generation)
        {
            var pastDamageRelations = type.PastDamageRelations;
            var pastGenerations = await PokeAPI.Get(pastDamageRelations.Select(t => t.Generation));

            if (pastGenerations.Any())
            {
                // use the earliest generation after the given one with past damage relation data, if it exists
                var laterGens = pastGenerations.Where(g => g.Id >= generation.Id).ToList();
                if (laterGens.Any())
                {
                    var genToUse = laterGens.Aggregate((g, h) => g.Id < h.Id ? g : h);
                    return pastDamageRelations.Single(p => p.Generation.Name == genToUse.Name)
                                                .DamageRelations;
                }
            }

            return null;
        }
    }
}
