using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For HM move information and calculations.
    /// </summary>
    public class HMData
    {
        /// <summary>
        /// The machines service.
        /// </summary>
        protected readonly MachinesService MachinesService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<HMData> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public HMData(MachinesService machinesService, ILogger<HMData> logger)
        {
            MachinesService = machinesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the HM moves in the version group with the given ID.
        /// </summary>
        public async Task<IEnumerable<Move>> GetHMMoves(int versionGroupId)
        {
            Logger.LogInformation($"Getting HM moves for version group {versionGroupId}...");
            return await MachinesService.GetHMMoves(versionGroupId);
        }
    }
}
