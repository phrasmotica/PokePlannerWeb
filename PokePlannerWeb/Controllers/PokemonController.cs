using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Services;

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
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// The Pokemon forms service.
        /// </summary>
        private readonly PokemonFormsService PokemonFormsService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<PokemonController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonController(PokemonService pokemonService, PokemonFormsService pokemonFormsService, ILogger<PokemonController> logger)
        {
            PokemonService = pokemonService;
            PokemonFormsService = pokemonFormsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the name of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/name")]
        public async Task<string> GetPokemonNameById(int pokemonId)
        {
            Logger.LogInformation($"Getting name of Pokemon {pokemonId}...");

            // get Pokemon document from database
            var entry = await PokemonService.GetOrCreate(pokemonId);
            return entry.GetDisplayName();
        }

        /// <summary>
        /// Returns the IDs of the forms of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/forms/{versionGroupId:int}/ids")]
        public async Task<int[]> GetPokemonFormIdsById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of forms of Pokemon {pokemonId} in version group {versionGroupId}...");

            // get Pokemon forms document from database
            var entry = await PokemonFormsService.GetOrCreate(pokemonId);
            return entry.GetFormIds().ToArray();
        }

        /// <summary>
        /// Returns the names of the forms of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/forms/{versionGroupId:int}/names")]
        public async Task<string[]> GetPokemonFormNamesById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting names of forms of Pokemon {pokemonId} in version group {versionGroupId}...");

            // get Pokemon forms document from database
            var entry = await PokemonFormsService.GetOrCreate(pokemonId);
            return entry.GetFormDisplayNames().ToArray();
        }

        /// <summary>
        /// Returns the URL of the sprite of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/sprite")]
        public async Task<string> GetPokemonSpriteUrlById(int pokemonId)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon {pokemonId}...");
            return await PokemonService.GetPokemonSpriteUrl(pokemonId);
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/sprite/shiny")]
        public async Task<string> GetPokemonShinySpriteUrlById(int pokemonId)
        {
            Logger.LogInformation($"Getting shiny sprite URL of Pokemon {pokemonId}...");
            return await PokemonService.GetPokemonShinySpriteUrl(pokemonId);
        }

        /// <summary>
        /// Returns the types of the Pokemon with the given ID in the version group with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/types/{versionGroupId:int}")]
        public async Task<string[]> GetPokemonTypesInVersionGroupById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon {pokemonId} in version group {versionGroupId}...");
            return await PokemonService.GetPokemonTypesInVersionGroup(pokemonId, versionGroupId);
        }

        /// <summary>
        /// Returns the base stats of the Pokemon with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/baseStats/{versionGroupId:int}")]
        public async Task<int[]> GetPokemonBaseStatsInVersionGroupById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats for Pokemon {pokemonId} in version group {versionGroupId}...");
            return await PokemonService.GetPokemonBaseStatsInVersionGroup(pokemonId, versionGroupId);
        }

        /// <summary>
        /// Returns the validity of the Pokemon with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/validity/{versionGroupId:int}")]
        public async Task<bool> GetPokemonValidityInVersionGroupById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting validity for Pokemon {pokemonId} in version group {versionGroupId}...");
            return await PokemonService.GetPokemonValidityInVersionGroup(pokemonId, versionGroupId);
        }
    }
}
