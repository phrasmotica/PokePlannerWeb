using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Payloads;
using System.Threading.Tasks;

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
        /// Returns the Type with the given numeric ID.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ResourcePayload<Type>> GetTypeById(int id)
        {
            var data = await PokeApiData.GetInstance();
            Logger.LogInformation($"Getting type with ID {id}...");
            var type = await data.Get<Type>(id);
            return type.AsPayload();
        }

        /// <summary>
        /// Returns the Type with the given name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<ResourcePayload<Type>> GetTypeByName(string name)
        {
            var data = await PokeApiData.GetInstance();
            Logger.LogInformation($"Getting type \"{name}\"...");
            var type = await data.Get<Type>(name);
            return type.AsPayload();
        }
    }
}
