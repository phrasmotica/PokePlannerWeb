using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Payloads;
using System.Threading.Tasks;

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
            var pokemon = await PokeApiData.Instance.Get<Pokemon>(id);
            return await pokemon.AsPayload();
        }

        /// <summary>
        /// Returns the Pokemon with the given species name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<PokemonPayload> GetPokemonByName(string name)
        {
            Logger.LogInformation($"Getting Pokemon \"{name}\"...");
            var pokemon = await PokeApiData.Instance.Get<Pokemon>(name);
            return await pokemon.AsPayload();
        }
    }
}
