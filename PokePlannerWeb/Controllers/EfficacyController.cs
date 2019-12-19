using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;

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
        [HttpPost]
        public async Task LoadTypeEfficacy()
        {
            await TypeData.Instance.LoadTypeEfficacy();
        }

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given species name in the version group with the given ID.
        /// </summary>
        [HttpGet("{name}/{versionGroupId:int}")]
        public async Task<double[]> GetEfficacyInVersionGroupByName(string name, int versionGroupId)
        {
            Logger.LogInformation($"Getting efficacy for Pokemon \"{name}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(name);
            return await pokemon.GetTypeEfficacyArr(versionGroupId);
        }
    }
}
