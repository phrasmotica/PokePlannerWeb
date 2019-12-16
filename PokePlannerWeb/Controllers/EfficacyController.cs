using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using System.Threading.Tasks;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for getting Pokemon type efficacies.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class EfficacyController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<EfficacyController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EfficacyController(ILogger<EfficacyController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given species name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<double[]> GetEfficacyByName(string name)
        {
            Logger.LogInformation($"Getting efficacy for Pokemon \"{name}\"...");
            var data = await PokeApiData.GetInstance();
            var pokemon = await data.Get<Pokemon>(name);
            return await pokemon.GetTypeEfficacyArr();
        }
    }
}
