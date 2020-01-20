using System.Collections.Generic;
using System.Threading.Tasks;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For HM move information and calculations.
    /// </summary>
    public class HMData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static HMData Instance { get; } = new HMData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private HMData() { }

        #endregion

        /// <summary>
        /// Returns the HM moves in the version group with the given ID.
        /// </summary>
        public async Task<IEnumerable<Move>> GetHMMoves(int versionGroupId)
        {
            var versionGroup = VersionGroupData.Instance.VersionGroups[versionGroupId];
            return await versionGroup.GetHMMoves();
        }
    }
}
