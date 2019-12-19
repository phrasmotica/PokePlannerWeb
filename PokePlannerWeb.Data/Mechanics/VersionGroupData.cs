using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For version group/generation information and calculations.
    /// </summary>
    public class VersionGroupData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static VersionGroupData Instance { get; } = new VersionGroupData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private VersionGroupData() { }

        #endregion

        /// <summary>
        /// Loads all version group data.
        /// </summary>
        public async Task LoadVersionGroups()
        {
            Console.WriteLine("PokeApiData: getting version group data...");
            VersionGroups = (await PokeAPI.GetMany<VersionGroup>()).ToArray();
            VersionGroupIndex = VersionGroups.Length - 1;
            Console.WriteLine($"PokeApiData: got data for {VersionGroups.Length} version groups.");
        }

        /// <summary>
        /// Gets or sets the version groups.
        /// </summary>
        public VersionGroup[] VersionGroups { get; set; }

        /// <summary>
        /// Gets or sets the index of the selected version group.
        /// </summary>
        public int VersionGroupIndex { get; set; }

        /// <summary>
        /// Returns the names of all version groups.
        /// </summary>
        public async Task<IEnumerable<string>> GetVersionGroupNames()
        {
            var names = new List<string>();
            foreach (var vg in VersionGroups)
            {
                var name = await vg.GetName();
                names.Add(name);
            }

            return names;
        }

        /// <summary>
        /// Returns the generation of the version group with the given ID.
        /// </summary>
        public async Task<Generation> GetGeneration(int versionGroupId)
        {
            var versionGroup = VersionGroups[versionGroupId];
            return await PokeAPI.Get(versionGroup.Generation);
        }
    }
}
