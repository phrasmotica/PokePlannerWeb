using System.Linq;
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
        /// Gets or sets the version groups.
        /// </summary>
        public VersionGroup[] VersionGroups
        {
            get => Data;
            set => Data = value;
        }

        /// <summary>
        /// Gets the index of the oldest version group.
        /// </summary>
        public int OldestVersionGroupId => VersionGroups.Select(vg => vg.Id).Min();

        /// <summary>
        /// Gets the index of the newest version group.
        /// </summary>
        public int NewestVersionGroupId => VersionGroups.Select(vg => vg.Id).Max();

        /// <summary>
        /// Returns the version group with the given ID.
        /// </summary>
        public VersionGroup Get(int versionGroupId)
        {
            return VersionGroups.Single(vg => vg.Id == versionGroupId);
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
