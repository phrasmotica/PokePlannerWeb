using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Services;

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
        /// THe Pokemon forms service.
        /// </summary>
        private readonly PokemonFormsService PokemonFormsService;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<FormController> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public FormController(PokemonFormsService pokemonFormsService, ILogger<FormController> logger)
        {
            PokemonFormsService = pokemonFormsService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the name of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{formId:int}/name")]
        public async Task<string> GetFormNameById(int formId)
        {
            Logger.LogInformation($"Getting name of Pokemon form {formId}...");
            return await PokemonFormsService.GetFormDisplayName(formId);
        }

        /// <summary>
        /// Returns the URL of the sprite of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{formId:int}/sprite")]
        public async Task<string> GetFormSpriteUrlById(int formId)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon form {formId}...");
            return await PokemonFormsService.GetFormSpriteUrl(formId);
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{formId:int}/sprite/shiny")]
        public async Task<string> GetFormShinySpriteUrlById(int formId)
        {
            Logger.LogInformation($"Getting shiny sprite URL of Pokemon form {formId}...");
            return await PokemonFormsService.GetFormShinySpriteUrl(formId);
        }

        /// <summary>
        /// Returns the types of the Pokemon form with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{formId:int}/types/{versionGroupId:int}")]
        public async Task<string[]> GetFormTypesInVersionGroupById(int formId, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon form {formId} in version group {versionGroupId}...");
            return await PokemonFormsService.GetFormTypesInVersionGroup(formId, versionGroupId);
        }
    }
}
