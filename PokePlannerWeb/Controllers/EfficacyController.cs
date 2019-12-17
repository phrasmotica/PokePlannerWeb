using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;
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
        /// Loads the type efficacy data from PokeAPI.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task LoadTypeEfficacy()
        {
            await TypeData.Instance.LoadTypeData();
        }

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given species name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<double[]> GetEfficacyByName(string name)
        {
            Logger.LogInformation($"Getting efficacy for Pokemon \"{name}\"...");
            var pokemon = await PokeApiData.Instance.Get<Pokemon>(name);
            return await pokemon.GetTypeEfficacyArr();
        }
    }
}
