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
        /// Returns the given Pokemon's types description in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/types/{versionGroupId:int}")]
        public async Task<string> GetPokemonTypesDescriptionInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return await pokemon.GetTypesDescription(versionGroupId);
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
