using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Cache;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Species resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class SpeciesController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<SpeciesController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public SpeciesController(ILogger<SpeciesController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the names of all species.
        /// </summary>
        [HttpGet("allNames")]
        public string[] GetAllSpeciesNames()
        {
            Logger.LogInformation($"Getting names of all species...");

            // read species names from cache
            var cache = PokemonSpeciesCacheManager.Instance.ReadCache();
            var cachedNames = cache.Entries.Select(e => e.DisplayNames.Single(dn => dn.Language == "en"))
                                           .Select(dn => dn.Name);
            return cachedNames.ToArray();
        }

        /// <summary>
        /// Returns the IDs of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/ids")]
        public async Task<int[]> GetSpeciesVarietyIdsById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of varieties of species of Pokemon {id} in version group {versionGroupId}...");

            // read variety IDs from cache
            var cache = PokemonSpeciesCacheManager.Instance.ReadCache();
            var entry = cache.Get(id);
            if (entry == null)
            {
                // get from PokeAPI
                var species = await PokeAPI.Get<PokemonSpecies>(id);
                return await species.GetVarietyIDs(versionGroupId);
            }

            var cachedIds = entry.Varieties.Select(v => v.Key);
            return cachedIds.ToArray();
        }

        /// <summary>
        /// Returns the names of the varieties of the species with the given ID.
        /// </summary>
        [HttpGet("{id:int}/varieties/{versionGroupId:int}/names")]
        public async Task<string[]> GetSpeciesVarietyNamesById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting names of varieties of species of Pokemon {id} in version group {versionGroupId}...");

            // read variety display names from cache
            var cache = PokemonSpeciesCacheManager.Instance.ReadCache();
            var entry = cache.Get(id);
            if (entry == null)
            {
                // get from PokeAPI
                var species = await PokeAPI.Get<PokemonSpecies>(id);
                return await species.GetVarietyNames(versionGroupId);
            }

            var cachedNames = entry.Varieties.Select(v => v.DisplayNames.Single(dn => dn.Language == "en"))
                                             .Select(dn => dn.Name);
            return cachedNames.ToArray();
        }
    }
}
