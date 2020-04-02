using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
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
        /// The logger.
        /// </summary>
        private readonly ILogger<PokemonController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonController(
            PokemonService pokemonService,
            ILogger<PokemonController> logger)
        {
            PokemonService = pokemonService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}")]
        public async Task<PokemonEntry> GetPokemonById(int pokemonId)
        {
            Logger.LogInformation($"Getting Pokemon {pokemonId}...");
            return await PokemonService.GetPokemon(pokemonId);
        }

        /// <summary>
        /// Returns the forms of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{pokemonId:int}/forms/{versionGroupId:int}")]
        public async Task<PokemonFormEntry[]> GetPokemonFormsById(int pokemonId, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of forms of Pokemon {pokemonId} in version group {versionGroupId}...");
            return await PokemonService.GetPokemonForms(pokemonId, versionGroupId);
        }
    }
}
