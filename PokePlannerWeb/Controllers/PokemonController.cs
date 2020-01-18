﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Cache;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.DataStore.Services;
using PokePlannerWeb.Data.Extensions;

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
        public PokemonController(PokemonService pokemonService, ILogger<PokemonController> logger)
        {
            PokemonService = pokemonService;
            Logger = logger;
        }

        /// <summary>
        /// Returns the name of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/name")]
        public async Task<string> GetPokemonNameById(int id)
        {
            Logger.LogInformation($"Getting name of Pokemon {id}...");

            // read name from cache
            var cachedName = PokemonCacheManager.Instance.GetPokemonDisplayName(id);
            if (string.IsNullOrEmpty(cachedName))
            {
                // get from PokeAPI
                var pokemon = await PokeAPI.Get<Pokemon>(id);
                return await pokemon.GetEnglishName();
            }

            return cachedName;
        }

        /// <summary>
        /// Returns the IDs of the forms of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/forms/{versionGroupId:int}/ids")]
        public async Task<int[]> GetPokemonFormIdsById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting IDs of forms of Pokemon {id} in version group {versionGroupId}...");

            // read form IDs from cache
            var cachedIds = PokemonCacheManager.Instance.GetPokemonFormIds(id);
            if (cachedIds == null)
            {
                // get from PokeAPI
                var pokemon = await PokeAPI.Get<Pokemon>(id);
                return await pokemon.GetFormIDs(versionGroupId);
            }

            return cachedIds;
        }

        /// <summary>
        /// Returns the names of the forms of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/forms/{versionGroupId:int}/names")]
        public async Task<string[]> GetPokemonFormNamesById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting names of forms of Pokemon {id} in version group {versionGroupId}...");

            // read form display names from cache
            var cachedNames = PokemonCacheManager.Instance.GetPokemonFormNames(id);
            if (cachedNames == null)
            {
                // get from PokeAPI
                var pokemon = await PokeAPI.Get<Pokemon>(id);
                return await pokemon.GetFormNames(versionGroupId);
            }

            return cachedNames;
        }

        /// <summary>
        /// Returns the URL of the sprite of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/sprite")]
        public async Task<string> GetPokemonSpriteUrlById(int id)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            var frontDefaultUrl = pokemon.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Sprite URL for Pokemon {id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(id);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/sprite/shiny")]
        public async Task<string> GetPokemonShinySpriteUrlById(int id)
        {
            Logger.LogInformation($"Getting shiny sprite URL of Pokemon {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            var frontShinyUrl = pokemon.Sprites.FrontShiny;
            if (frontShinyUrl == null)
            {
                Logger.LogInformation($"Shiny sprite URL for Pokemon {id} missing from PokeAPI, creating URL manually");
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
        /// Returns the types of the Pokemon with the given ID in the version group with the given ID.
        /// </summary>
        [HttpGet("{id:int}/types/{versionGroupId:int}")]
        public async Task<string[]> GetPokemonTypesInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon {id} in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            var types = await pokemon.GetTypes(versionGroupId);
            return types.Select(t => t.ToString()).ToArray();
        }

        /// <summary>
        /// Returns the base stats of the Pokemon with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{id:int}/baseStats/{versionGroupId:int}")]
        public async Task<int[]> GetPokemonBaseStatsInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats for Pokemon {id} in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return pokemon.GetBaseStats(versionGroupId);
        }

        /// <summary>
        /// Returns the validity of the Pokemon with the given ID in the version group with the
        /// given ID.
        /// </summary>
        [HttpGet("{id:int}/validity/{versionGroupId:int}")]
        public async Task<bool> GetPokemonValidityInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting validity for Pokemon {id} in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return await pokemon.IsValid(versionGroupId);
        }
    }
}
