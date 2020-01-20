using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Generic controller that provides an endpoint for loading all of a type of PokeAPI resource
    /// into the relevant singleton.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public abstract class ResourceController<T> : ControllerBase where T : NamedApiResource
    {
        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<ResourceController<T>> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public ResourceController(ILogger<ResourceController<T>> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// POST endpoint for loading the resource data from PokeAPI.
        /// </summary>
        [HttpPost]
        public async Task LoadData()
        {
            Logger.LogInformation($"{GetType().Name}: loading {typeof(T).Name} data...");
            await LoadResources();
            Logger.LogInformation($"{GetType().Name}: loaded {typeof(T).Name} data.");
        }

        /// <summary>
        /// Loads the resource data from PokeAPI.
        /// </summary>
        protected abstract Task LoadResources();
    }
}
