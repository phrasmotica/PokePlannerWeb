using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods for the PokeAPI VersionGroup type.
    /// </summary>
    public static class VersionGroupExtensions
    {
        /// <summary>
        /// Returns the name of this version group.
        /// </summary>
        public static async Task<string> GetName(this VersionGroup vg)
        {
            var versions = await PokeAPI.Get(vg.Versions);
            return string.Join("/", versions.Select(v => v.Names.GetName()));
        }

        /// <summary>
        /// Returns the names of the base stats in the version group with the given ID.
        /// </summary>
        public static IEnumerable<string> GetBaseStatNames(this VersionGroup versionGroup)
        {
            return StatData.Instance.Stats.Where(s => !s.IsBattleOnly)
                                          .Select(s => s.Names.GetName());
        }
    }
}
