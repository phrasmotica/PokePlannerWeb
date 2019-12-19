using System.Linq;
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
        /// Returns the names of all concrete types.
        /// </summary>
        [HttpGet("concrete")]
        public string[] GetConcreteTypeNames()
        {
            Logger.LogInformation("Getting concrete type names...");
            return TypeData.Instance.GetConcreteTypeNames().ToArray();
        }
    }
}
