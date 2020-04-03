using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for accessing machines information.
    /// </summary>
    public class MachineService
    {
        // TODO: create cache service
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
        protected readonly VersionGroupService VersionGroupsService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<MachineService> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MachineService(
            IPokeAPI pokeApi,
            VersionGroupService versionGroupsService,
            ILogger<MachineService> logger)
        {
            PokeApi = pokeApi;
            VersionGroupsService = versionGroupsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all HM moves present in the version group with the given ID.
        /// </summary>
        public async Task<List<Move>> GetHMMoves(int versionGroupId)
        {
            var versionGroup = await VersionGroupsService.Upsert(versionGroupId);

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
