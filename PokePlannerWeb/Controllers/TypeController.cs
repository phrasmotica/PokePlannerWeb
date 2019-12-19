using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.Mechanics;

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
        /// Returns the names of all concrete types in the version group with the given ID.
        /// </summary>
        [HttpGet("concrete/{versionGroupId:int}")]
        public async Task<string[]> GetConcreteTypeNames(int versionGroupId)
        {
            Logger.LogInformation($"Getting concrete type names for version group {versionGroupId}...");
            var typeNames = await TypeData.Instance.GetConcreteTypeNames(versionGroupId);
            return typeNames.ToArray();
        }
    }
}
