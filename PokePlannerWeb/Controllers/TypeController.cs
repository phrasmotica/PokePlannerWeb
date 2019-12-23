using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.Types;

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
        /// The logger.
        /// </summary>
        private readonly ILogger<TypeController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public TypeController(ILogger<TypeController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the type set for the version group with the given ID.
        /// </summary>
        [HttpGet("typeSet/{versionGroupId:int}")]
        public async Task<TypeSet> GetTypeSet(int versionGroupId)
        {
            Logger.LogInformation($"Getting type set for version group {versionGroupId}...");
            return await TypeData.Instance.GetTypeSet(versionGroupId);
        }
    }
}
