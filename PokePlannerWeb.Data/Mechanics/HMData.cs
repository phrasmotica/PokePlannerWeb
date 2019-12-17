using System.Collections.Generic;
using System.Threading.Tasks;
using PokeApiNet.Models;
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
        /// Returns the selected version group's HM moves.
        /// </summary>
        public async Task<IEnumerable<Move>> GetHMMoves() => await VersionGroupData.Instance.VersionGroup.GetHMMoves();
    }
}
