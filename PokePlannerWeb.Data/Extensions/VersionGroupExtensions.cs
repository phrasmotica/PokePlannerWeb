using PokeApiNet.Models;
using PokePlannerWeb.Data.Util;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            var versions = await PokeApiData.Instance.Get(vg.Versions);
            return string.Join("/", versions.Select(v => v.GetEnglishName()));
        }
    }
}
