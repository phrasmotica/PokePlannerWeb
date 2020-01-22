using System.Threading.Tasks;
using PokeApiNet;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For version group/generation information and calculations.
    /// </summary>
    public class VersionGroupData : ResourceData<VersionGroup>
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static new VersionGroupData Instance { get; } = new VersionGroupData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private VersionGroupData() { }

        #endregion

        /// <summary>
        /// Loads all version group data.
        /// </summary>
        public override async Task LoadData()
        {
            await base.LoadData();
            VersionGroupIndex = VersionGroups.Length - 1;
        }

        /// <summary>
        /// Gets or sets the version groups.
        /// </summary>
        public VersionGroup[] VersionGroups
        {
            get => Data;
            set => Data = value;
        }

        /// <summary>
        /// Gets or sets the index of the selected version group.
        /// </summary>
        public int VersionGroupIndex { get; set; }

        /// <summary>
        /// Gets the index of the latest version group.
        /// </summary>
        public int LatestVersionGroupIndex => VersionGroups.Length - 1;

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
