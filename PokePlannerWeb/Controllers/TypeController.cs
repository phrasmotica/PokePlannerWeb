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
        /// The Types service.
        /// </summary>
        private readonly TypeService TypesService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<TypeController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public TypeController(
            TypeService typesService,
            ILogger<TypeController> logger)
        {
            TypesService = typesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns all types.
        /// </summary>
        public async Task<TypeEntry[]> GetTypes()
        {
            Logger.LogInformation("Getting types...");
            return await TypesService.GetAll();
        }

        /// <summary>
        /// Returns the types presence map for the version group with the given ID.
        /// </summary>
        [HttpGet("presence/{versionGroupId:int}")]
        public async Task<TypesPresenceMap> GetTypesPresenceMap(int versionGroupId)
        {
            Logger.LogInformation($"Getting types presence map for version group {versionGroupId}...");
            return await TypesService.GetTypesPresenceMap(versionGroupId);
        }

        /// <summary>
        /// Returns the type with the given ID.
        /// </summary>
        [HttpGet("type/{typeId:int}/name")]
        public async Task<TypeEntry> GetTypeById(int typeId)
        {
            Logger.LogInformation($"Getting type {typeId}...");
            return await TypesService.Upsert(typeId);
        }
    }
}
