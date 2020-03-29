using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokePlannerWeb.Data.DataStore.Models;
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
        /// Returns the Pokemon form with the given ID.
        /// </summary>
        [HttpGet("{formId:int}")]
        public async Task<PokemonFormsEntry> GetFormById(int formId)
        {
            Logger.LogInformation($"Getting Pokemon form {formId}...");
            return await PokemonFormsService.GetPokemonForm(formId);
        }
    }
}
