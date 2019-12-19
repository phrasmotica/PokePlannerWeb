using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Payloads;

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
        /// Returns the Pokemon with the given numeric ID.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<PokemonPayload> GetPokemonById(int id)
        {
            Logger.LogInformation($"Getting Pokemon with ID {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return await pokemon.AsPayload();
        }

        /// <summary>
        /// Returns the Pokemon with the given species name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<PokemonPayload> GetPokemonByName(string name)
        {
            Logger.LogInformation($"Getting Pokemon \"{name}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(name);
            return await pokemon.AsPayload();
        }

        /// <summary>
        /// Returns a description of the types of the Pokemon with the given species name in the
        /// version group with the given ID.
        /// </summary>
        [HttpGet("{name}/types/{versionGroupId:int}")]
        public async Task<string> GetPokemonTypesDescriptionByVersionGroup(string name, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon \"{name}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(name);
            return await pokemon.GetTypesDescription(versionGroupId);
        }
    }
}
