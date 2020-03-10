using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For version group/generation information and calculations.
    /// </summary>
    public class VersionGroupData : ResourceData<VersionGroup>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupData(IPokeAPI pokeApi, ILogger<VersionGroupData> logger) : base(pokeApi, logger)
        {
        }

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
        /// Returns the version group with the given ID.
        /// </summary>
        public VersionGroup Get(int versionGroupId)
        {
            return VersionGroups[versionGroupId - 1];
        }

        /// <summary>
        /// Returns the generation of the version group with the given ID.
        /// </summary>
        public async Task<Generation> GetGeneration(int versionGroupId)
        {
            var versionGroup = Get(versionGroupId);
            return await PokeApi.Get(versionGroup.Generation);
        }
    }
}
