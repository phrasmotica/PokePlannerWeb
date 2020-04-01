using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using Pokemon = PokeApiNet.Pokemon;
using PokemonEntry = PokePlannerWeb.Data.DataStore.Models.PokemonEntry;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon entries in the database.
    /// </summary>
    public class PokemonService : NamedApiResourceServiceBase<Pokemon, PokemonEntry>
    {
        /// <summary>
        /// The Pokemon forms service.
        /// </summary>
        private readonly PokemonFormsService PokemonFormsService;

        /// <summary>
        /// The types service.
        /// </summary>
        private readonly TypesService TypesService;

        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupsService VersionGroupsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonService(
            ICacheSource<PokemonEntry> cacheSource,
            IPokeAPI pokeApi,
            PokemonFormsService pokemonFormsService,
            TypesService typesService,
            VersionGroupsService versionGroupsService,
            ILogger<PokemonService> logger) : base(cacheSource, pokeApi, logger)
        {
            PokemonFormsService = pokemonFormsService;
            TypesService = typesService;
            VersionGroupsService = versionGroupsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
        {
            var forms = await GetForms(pokemon);
            var types = await GetTypes(pokemon);
            var baseStats = await GetBaseStats(pokemon);

            return new PokemonEntry
            {
                Key = pokemon.Id,
                Name = pokemon.Name,
                SpriteUrl = GetSpriteUrl(pokemon),
                ShinySpriteUrl = GetShinySpriteUrl(pokemon),
                Forms = forms.ToList(),
                Types = types,
                BaseStats = baseStats
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the data store.
        /// </summary>
        public async Task<PokemonEntry> GetPokemon(int pokemonId)
        {
            return await Upsert(pokemonId);
        }

        /// <summary>
        /// Returns the Pokemon forms of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<PokemonFormEntry[]> GetPokemonForms(int pokemonId, int versionGroupId)
        {
            var entry = await Upsert(pokemonId);
            var formEntries = await PokemonFormsService.UpsertMany(entry.Forms.Select(f => f.Id));
            return formEntries.OrderBy(f => f.FormId).ToArray();
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetSpriteUrl(Pokemon pokemon)
        {
            var frontDefaultUrl = pokemon.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Front default sprite URL for Pokemon {pokemon.Id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(pokemon.Id);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetShinySpriteUrl(Pokemon pokemon)
        {
            var frontShinyUrl = pokemon.Sprites.FrontShiny;
            if (frontShinyUrl == null)
            {
                Logger.LogInformation($"Front shiny sprite URL for Pokemon {pokemon.Id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(pokemon.Id, true);
            }

            return frontShinyUrl;
        }

        /// <summary>
        /// Creates and returns the URL of the sprite of the Pokemon with the given ID.
        /// </summary>
        private string MakeSpriteUrl(int pokemonId, bool shiny = false)
        {
            const string baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
            if (shiny)
            {
                return $"{baseUrl}/shiny/{pokemonId}.png";
            }

            return $"{baseUrl}/{pokemonId}.png";
        }

        /// <summary>
        /// Returns the Pokemon that this Pokemon species represents.
        /// </summary>
        private async Task<IEnumerable<PokemonForm>> GetForms(Pokemon pokemon)
        {
            var formsList = new List<PokemonForm>();

            foreach (var form in pokemon.Forms)
            {
                var source = await PokemonFormsService.Upsert(form);
                formsList.Add(new PokemonForm
                {
                    Id = source.FormId,
                    Name = source.Name
                });
            }

            return formsList;
        }

        /// <summary>
        /// Returns the types of the given Pokemon in all version groups.
        /// </summary>
        private async Task<List<WithId<Type[]>>> GetTypes(Pokemon pokemon)
        {
            var typesList = new List<WithId<Type[]>>();

            var newestIdWithoutData = VersionGroupsService.OldestVersionGroupId;

            if (pokemon.PastTypes.Any())
            {
                foreach (var vg in await VersionGroupsService.GetAll())
                {
                    var types = pokemon.PastTypes.FirstOrDefault(t => t.Generation.Name == vg.Generation.Name);
                    if (types != null)
                    {
                        var typeEntries = await MinimiseTypes(types.Types);
                        for (var id = newestIdWithoutData; id <= vg.VersionGroupId; id++)
                        {
                            typesList.Add(new WithId<Type[]>(id, typeEntries.ToArray()));
                        }

                        newestIdWithoutData = vg.VersionGroupId + 1;
                    }
                }
            }

            // always include the newest types
            var newestId = VersionGroupsService.NewestVersionGroupId;
            var newestTypeEntries = await MinimiseTypes(pokemon.Types);
            for (var id = newestIdWithoutData; id <= newestId; id++)
            {
                typesList.Add(new WithId<Type[]>(id, newestTypeEntries.ToArray()));
            }

            return typesList;
        }

        /// <summary>
        /// Minimises a set of Pokemon types.
        /// </summary>
        private async Task<IEnumerable<Type>> MinimiseTypes(IEnumerable<PokemonType> types)
        {
            var newestTypeObjs = await TypesService.UpsertMany(types.Select(t => t.Type));
            return newestTypeObjs.Select(t => new Type
            {
                Id = t.TypeId,
                Name = t.Name
            });
        }

        /// <summary>
        /// Returns the base stats of the given Pokemon.
        /// </summary>
        private async Task<List<WithId<int[]>>> GetBaseStats(Pokemon pokemon)
        {
            // FUTURE: anticipating a generation-based base stats changelog
            // in which case this method will need to look like GetTypes()
            var newestId = VersionGroupsService.NewestVersionGroupId;
            var currentBaseStats = pokemon.GetBaseStats(newestId);

            var versionGroups = await VersionGroupsService.GetAll();
            var statsList = versionGroups.Select(
                vg => new WithId<int[]>(vg.VersionGroupId, currentBaseStats)
            );

            return statsList.ToList();
        }

        #endregion
    }
}
