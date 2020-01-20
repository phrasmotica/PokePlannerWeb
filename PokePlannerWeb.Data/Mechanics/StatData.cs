using System.Collections.Generic;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For stat information and calculations.
    /// </summary>
    public class StatData : ResourceData<Stat>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static new StatData Instance { get; } = new StatData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private StatData() { }

        #endregion

        /// <summary>
        /// Gets or sets the stats.
        /// </summary>
        public Stat[] Stats
        {
            get => Data;
            set => Data = value;
        }

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
