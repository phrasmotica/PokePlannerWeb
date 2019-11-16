using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokePlannerWeb.Controllers
{
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
        /// Returns a collection of Pokemon.
        /// </summary>
        [HttpGet]
        public async Task<IEnumerable<Pokemon>> GetAsync()
        {
            var rng = new Random();
            var range = Enumerable.Repeat(0, Constants.TEAM_SIZE).Select(x => rng.Next(493) + 1);
            var tasks = range.Select(async id => {
                Logger.LogInformation($"Getting Pokemon {id}...");
                return await PokeApiData.Get<Pokemon>(id);
            });
            return await Task.WhenAll(tasks);
        }
    }
}
