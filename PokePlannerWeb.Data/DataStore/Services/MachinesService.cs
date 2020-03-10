using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Mechanics;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for accessing machines information.
    /// </summary>
    public class MachinesService
    {
        /// <summary>
        /// The number of HM items in the Pokemon series.
        /// </summary>
        public const int NUMBER_OF_HMS = 8;

        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected IPokeAPI PokeApi;

        /// <summary>
        /// The version group data singleton.
        /// </summary>
        protected readonly VersionGroupData VersionGroupData;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<MachinesService> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MachinesService(
            IPokeAPI pokeApi,
            VersionGroupData versionGroupData,
            ILogger<MachinesService> logger)
        {
            PokeApi = pokeApi;
            VersionGroupData = versionGroupData;
            Logger = logger;
        }

        /// <summary>
        /// Returns all HM moves present in the version group with the given ID.
        /// </summary>
        public async Task<List<Move>> GetHMMoves(int versionGroupId)
        {
            var versionGroup = VersionGroupData.Get(versionGroupId);

            var hmMoves = new List<Move>();
            for (int i = 0; i < NUMBER_OF_HMS; i++)
            {
                // fetch HMs by known names for now
                var hm = await PokeApi.Get<Item>($@"hm{i + 1:D2}");
                var mvd = hm.Machines.SingleOrDefault(mch => mch.VersionGroup.Name == versionGroup.Name);

                if (mvd != null)
                {
                    var machine1 = await PokeApi.Get(mvd.Machine);
                    var move = await PokeApi.Get(machine1.Move);
                    hmMoves.Add(move);
                }
            }

            return hmMoves;
        }
    }
}
