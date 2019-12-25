﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;

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
        /// Returns the names of all Pokemon.
        /// </summary>
        [HttpGet("allNames")]
        public async Task<string[]> GetAllPokemonNames()
        {
            Logger.LogInformation($"Getting names of all Pokemon...");
            return await PokemonData.Instance.GetAllPokemonNames();
        }

        /// <summary>
        /// Returns the given Pokemon's name.
        /// </summary>
        [HttpGet("{species}/name")]
        public async Task<string> GetPokemonName(string species)
        {
            Logger.LogInformation($"Getting name of Pokemon \"{species}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return await pokemon.GetEnglishName();
        }

        /// <summary>
        /// Returns the given Pokemon's name.
        /// </summary>
        [HttpGet("{species}/sprite")]
        public async Task<string> GetPokemonSpriteUrl(string species)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon \"{species}\"...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return pokemon.Sprites.FrontDefault;
        }

        /// <summary>
        /// Returns the given Pokemon's types in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/types/{versionGroupId:int}")]
        public async Task<string[]> GetPokemonTypesInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting types for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            var types = await pokemon.GetTypes(versionGroupId);
            return types.Select(t => t.ToString()).ToArray();
        }

        /// <summary>
        /// Returns the given Pokemon's base stats in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/baseStats/{versionGroupId:int}")]
        public async Task<int[]> GetPokemonBaseStatsInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return pokemon.GetBaseStats(versionGroupId);
        }

        /// <summary>
        /// Returns the given Pokemon's validity in the version group with the given ID.
        /// </summary>
        [HttpGet("{species}/validity/{versionGroupId:int}")]
        public async Task<bool> GetPokemonValidityInVersionGroup(string species, int versionGroupId)
        {
            Logger.LogInformation($"Getting validity for Pokemon \"{species}\" in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(species);
            return await pokemon.IsValid(versionGroupId);
        }

        /// <summary>
        /// Returns the name of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/name")]
        public async Task<string> GetPokemonNameById(int id)
        {
            Logger.LogInformation($"Getting name of Pokemon {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return await pokemon.GetEnglishName();
        }

        /// <summary>
        /// Returns the sprite of the Pokemon with the given ID.
        /// </summary>
        [HttpGet("{id:int}/sprite")]
        public async Task<string> GetPokemonSpriteUrlById(int id)
        {
            Logger.LogInformation($"Getting sprite URL of Pokemon {id}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return pokemon.Sprites.FrontDefault;
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
        /// Returns the base stats of the Pokemon with the given ID in the version group with the given ID.
        /// </summary>
        [HttpGet("{id:int}/baseStats/{versionGroupId:int}")]
        public async Task<int[]> GetPokemonBaseStatsInVersionGroupById(int id, int versionGroupId)
        {
            Logger.LogInformation($"Getting base stats for Pokemon {id} in version group {versionGroupId}...");
            var pokemon = await PokeAPI.Get<Pokemon>(id);
            return pokemon.GetBaseStats(versionGroupId);
        }

        /// <summary>
        /// Returns the validity of the Pokemon with the given ID in the version group with the given ID.
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
