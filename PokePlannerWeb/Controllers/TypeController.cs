using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Type resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class TypeController : ControllerBase
    {
        /// <summary>
        /// The type service.
        /// </summary>
        private readonly TypeService TypeService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<TypeController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public TypeController(TypeService typeService, ILogger<TypeController> logger)
        {
            TypeService = typeService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all types.
        /// </summary>
        public async Task<TypeEntry[]> GetTypes()
        {
            Logger.LogInformation("Getting types...");
            return await TypeService.GetAll();
        }

        /// <summary>
        /// Returns the types presence map for the version group with the given ID.
        /// </summary>
        [HttpGet("presence/{versionGroupId:int}")]
        public async Task<TypesPresenceMap> GetTypesPresenceMap(int versionGroupId)
        {
            Logger.LogInformation($"Getting types presence map for version group {versionGroupId}...");
            return await TypeService.GetTypesPresenceMap(versionGroupId);
        }

        /// <summary>
        /// Returns the type set for the version group with the given ID.
        /// </summary>
        [HttpGet("{versionGroupId:int}")]
        public async Task<VersionGroupTypeContext[]> GetTypesByVersionGroupId(int versionGroupId)
        {
            Logger.LogInformation($"Getting types for version group {versionGroupId}...");
            return await TypeService.GetTypesByVersionGroupId(versionGroupId);
        }
    }
}
