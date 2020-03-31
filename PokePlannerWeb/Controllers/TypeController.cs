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
        private readonly TypesService TypesService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<TypeController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public TypeController(
            TypesService typesService,
            ILogger<TypeController> logger)
        {
            TypesService = typesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the type set for the version group with the given ID.
        /// </summary>
        [HttpGet("typeSet/{versionGroupId:int}")]
        public async Task<TypeSet> GetTypeSet(int versionGroupId)
        {
            Logger.LogInformation($"Getting type set for version group {versionGroupId}...");
            return await TypesService.GetTypeSet(versionGroupId);
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
