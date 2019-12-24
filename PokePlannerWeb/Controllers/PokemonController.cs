using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Pokemon resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class PokemonController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<PokemonController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonController(ILogger<PokemonController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the given Pokemon's name.
        /// </summary>
        [HttpGet("{species}/name")]
        public async Task<string> GetPokemonName(string species)
        {
            Logger.LogInformation($"Getting name of Pokemon \"{species}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return await pokemon.GetEnglishName();
        }

        /// <summary>
        /// Returns the given Pokemon's name.
        /// </summary>
        [HttpGet("{species}/sprite")]
        public async Task<string> GetPokemonSpriteUrl(string species)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon \"{species}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return pokemon.Sprites.FrontDefault;
        }

        /// <summary>
        /// Returns the given Pokemon's types in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/types/{versionGroupId:int}")]
        public async Task<string[]> GetPokemonTypesInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            var types = await pokemon.GetTypes(versionGroupId);
            return types.Select(t => t.ToString()).ToArray();
        }

        /// <summary>
        /// Returns the given Pokemon's base stats in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/baseStats/{versionGroupId:int}")]
        public async Task<int[]> GetPokemonBaseStatsInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return pokemon.GetBaseStats(versionGroupId);
        }

        /// <summary>
        /// Returns the given Pokemon's validity in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/validity/{versionGroupId:int}")]
        public async Task<bool> GetPokemonValidityInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting validity for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return await pokemon.IsValid(versionGroupId);
        }
    }
}
