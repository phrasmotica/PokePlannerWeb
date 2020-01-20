using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Controllers
{
    /// <summary>
    /// Controller for calling Form resource endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class FormController : ControllerBase
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<FormController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public FormController(ILogger<FormController> logger)
        {
            Logger = logger;
        }

        /// <summary>
        /// Returns the name of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{id:int}/name")]
        public async Task<string> GetFormNameById(int id)
        {
            Logger.LogInformation($"Getting name of Pokemon form {id}...");
            var form = await PokeAPI.Get<PokemonForm>(id);
            return form.Names.GetName();
        }

        /// <summary>
        /// Returns the URL of the sprite of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{id:int}/sprite")]
        public async Task<string> GetFormSpriteUrlById(int id)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon form {id}...");
            var form = await PokeAPI.Get<PokemonForm>(id);
            var frontDefaultUrl = form.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Sprite URL for Pokemon form {id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(id);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{id:int}/sprite/shiny")]
        public async Task<string> GetFormShinySpriteUrlById(int id)
        {
            Logger.LogInformation($"Getting shiny sprite URL of Pokemon form {id}...");
            var form = await PokeAPI.Get<PokemonForm>(id);
            var frontShinyUrl = form.Sprites.FrontShiny;
            if (frontShinyUrl == null)
            {
                Logger.LogInformation($"Shiny sprite URL for Pokemon form {id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(id, true);
            }

            return frontShinyUrl;
        }

        /// <summary>
        /// Creates and returns the URL of the sprite of the Pokemon with the given ID.
        /// </summary>
        private string MakeSpriteUrl(int id, bool shiny = false)
        {
            const string baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
            if (shiny)
            {
                return $"{baseUrl}/shiny/{id}.png";
            }

            return $"{baseUrl}/{id}.png";
        }

        /// <summary>
        /// Returns the types of the Pokemon form with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{id:int}/types/{versionGroupId:int}")]
        public async Task<string[]> GetFormTypesInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon form {id} in version group {versionGroupId}...");
            var form = await PokeAPI.Get<PokemonForm>(id);
            var types = await form.GetTypes(versionGroupId);
            return types.Select(t => t.ToString()).ToArray();
        }
    }
}
