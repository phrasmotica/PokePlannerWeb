﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;

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
            return form.GetEnglishName();
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
    }
}
