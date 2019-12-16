using PokeApiNet.Models;
using System.Linq;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for querying damage relations between Pokemon types.
    /// </summary>
    public static class DamageRelationExtensions
    {
        /// <summary>
        /// Returns this type's damage relations in the current version group.
        /// </summary>
        public static async Task<TypeRelations> GetDamageRelations(this Type type)
        {
            var data = await PokeApiData.GetInstance();
            var versionGroup = data.VersionGroup;
            var relations = await type.GetDamageRelations(versionGroup);
            return relations;
        }

        /// <summary>
        /// Returns this type's damage relations data for the given generation, if any.
        /// </summary>
        private static async Task<TypeRelations> GetPastDamageRelations(this Type type, Generation generation)
        {
            var data = await PokeApiData.GetInstance();
            var pastDamageRelations = type.PastDamageRelations;
            var pastGenerations = await data.Get(pastDamageRelations.Select(t => t.Generation));

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

        /// <summary>
        /// Returns this type's damage relations in the given version group.
        /// </summary>
        private static async Task<TypeRelations> GetDamageRelations(this Type type, VersionGroup versionGroup)
        {
            var data = await PokeApiData.GetInstance();
            var generation = await data.Get(versionGroup.Generation);
            var pastDamageRelations = await type.GetPastDamageRelations(generation);
            return pastDamageRelations ?? type.DamageRelations;
        }
    }
}
