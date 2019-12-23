using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For stat information and calculations.
    /// </summary>
    public class StatData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static StatData Instance { get; } = new StatData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private StatData() { }

        #endregion

        /// <summary>
        /// Loads all stat data.
        /// </summary>
        public async Task LoadStats()
        {
            Console.WriteLine("StatData: getting stat data...");
            Stats = (await PokeAPI.GetMany<Stat>()).ToArray();
            Console.WriteLine($"StatData: got data for {Stats.Length} stats.");
        }

        /// <summary>
        /// Gets or sets the stats.
        /// </summary>
        public Stat[] Stats { get; set; }

        /// <summary>
        /// Returns the names of the base stats in the version group with the given ID.
        /// </summary>
        public IEnumerable<string> GetBaseStatNames(int versionGroupId)
        {
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId];
            return versionGroup.GetBaseStatNames();
        }
    }
}
