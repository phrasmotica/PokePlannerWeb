using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Types;
using Type = PokePlannerWeb.Data.Types.Type;

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
        /// Loads the type efficacy data for the latest version group from PokeAPI.
        /// </summary>
        [HttpPost]
        public async Task LoadTypeEfficacy()
        {
            Logger.LogInformation($"Loading efficacy for latest version group...");
            await TypeData.Instance.LoadTypeEfficacy();
        }

        /// <summary>
        /// Loads the type efficacy data for the given version group from PokeAPI.
        /// </summary>
        [HttpPost("{versionGroupId:int}")]
        public async Task LoadTypeEfficacy(int versionGroupId)
        {
            Logger.LogInformation($"Loading efficacy for version group {versionGroupId}...");
            await TypeData.Instance.LoadTypeEfficacy(versionGroupId);
        }

        /// <summary>
        /// Returns the efficacy of the given types in the version group with the given ID.
        /// </summary>
        [HttpGet]
        public double[] GetEfficacyInVersionGroupByTypeNames(int versionGroupId, string type1, string type2)
        {
            Logger.LogInformation($"Getting efficacy for {type1}-{type2} in version group {versionGroupId}...");
            var types = new[] { type1, type2 }.Where(s => !string.IsNullOrEmpty(s))
                                              .Select(s => s.ToEnum<Type>())
                                              .Where(t => TypeData.ConcreteTypes.Contains(t));
            return TypeData.Instance.GetEfficacyArr(types);
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

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given ID in the version group with the given ID.
        /// </summary>
        [HttpGet("{id:int}/{versionGroupId:int}")]
        public async Task<double[]> GetEfficacyInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting efficacy for Pokemon {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return await pokemon.GetTypeEfficacyArr(versionGroupId);
        }
    }
}
