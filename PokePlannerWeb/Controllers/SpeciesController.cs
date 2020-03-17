using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Species resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class SpeciesController
    {
        /// <summary>
        /// The Pokemon species service.
        /// </summary>
        private readonly PokemonSpeciesService PokemonSpeciesService;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<SpeciesController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public SpeciesController(
            PokemonSpeciesService pokemonSpeciesService,
            ILogger<SpeciesController> logger)
        {
            PokemonSpeciesService = pokemonSpeciesService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of all Pokemon species.
        /// </summary>
        [HttpGet("allNames")]
        public async Task<string[]> GetAllSpeciesNames()
        {
            Logger.LogInformation($"Getting names of all Pokemon species...");
            var entries = await PokemonSpeciesService.GetPokemonSpecies();
            return entries.Select(e => e.DisplayNames.SingleOrDefault(n => n.Language == "en"))
                          .Select(n => n.Name)
                          .ToArray();
        }

        /// <summary>
        /// Returns the all Pokemon species.
        /// </summary>
        [HttpGet("all")]
        public async Task<PokemonSpeciesEntry[]> GetPokemonSpecies()
        {
            Logger.LogInformation($"Getting all Pokemon species...");
            return await PokemonSpeciesService.GetPokemonSpecies();
        }
    }
}
