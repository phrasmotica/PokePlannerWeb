using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon forms entries in the database.
    /// </summary>
    public class PokemonFormsService : NamedApiResourceServiceBase<PokemonForm, PokemonFormEntry>
    {
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
        public PokemonFormsService(
            ICacheSource<PokemonFormEntry> cacheSource,
            IPokeAPI pokeApi,
            TypesService typesService,
            VersionGroupsService versionGroupsService,
            ILogger<PokemonFormsService> logger) : base(cacheSource, pokeApi, logger)
        {
            VersionGroupsService = versionGroupsService;
            TypesService = typesService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonFormEntry> ConvertToEntry(PokemonForm pokemonForm)
        {
            var types = await GetTypes(pokemonForm);
            var versionGroup = await VersionGroupsService.Upsert(pokemonForm.VersionGroup);
            var validity = await GetValidity(pokemonForm);

            return new PokemonFormEntry
            {
                Key = pokemonForm.Id,
                Name = pokemonForm.Name,
                FormName = pokemonForm.FormName,
                IsMega = pokemonForm.IsMega,
                VersionGroup = new VersionGroup
                {
                    Id = versionGroup.VersionGroupId,
                    Name = versionGroup.Name
                },
                DisplayNames = pokemonForm.GetDisplayNames().ToList(),
                SpriteUrl = GetSpriteUrl(pokemonForm),
                ShinySpriteUrl = GetShinySpriteUrl(pokemonForm),
                Types = types.ToList(),
                Validity = validity.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the Pokemon form with the given ID from the data store.
        /// </summary>
        public async Task<PokemonFormEntry> GetPokemonForm(int formId)
        {
            return await Upsert(formId);
        }

        /// <summary>
        /// Returns the display names of the forms of the Pokemon with the given ID in the given
        /// locale from the data store.
        /// </summary>
        //public async Task<IEnumerable<string>> GetFormDisplayNames(int pokemonId, string locale = "en")
        //{
        //    var entry = await GetOrCreate(pokemonId);
        //    return entry.GetFormDisplayNames(locale);
        //}

        /// <summary>
        /// Returns the display name of the Pokemon form with the given ID in the given locale.
        /// </summary>
        //public async Task<string> GetFormDisplayName(int formId, string locale = "en")
        //{
        //    var form = await PokeApi.Get<PokemonForm>(formId);
        //    return form.Names.GetName(locale);
        //}

        /// <summary>
        /// Returns the types of the Pokemon form with the given ID in the version group with the
        /// given ID.
        /// </summary>
        //public async Task<string[]> GetFormTypesInVersionGroup(int formId, int versionGroupId)
        //{
        //    var form = await PokeApi.Get<PokemonForm>(formId);
        //    var types = await GetTypes(form, versionGroupId);
        //    return types.ToArray();
        //}

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetSpriteUrl(PokemonForm pokemonForm)
        {
            var frontDefaultUrl = pokemonForm.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Front default sprite URL for Pokemon form {pokemonForm.Id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(pokemonForm.Id);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetShinySpriteUrl(PokemonForm pokemonForm)
        {
            var frontShinyUrl = pokemonForm.Sprites.FrontShiny;
            if (frontShinyUrl == null)
            {
                Logger.LogInformation($"Front shiny sprite URL for Pokemon form {pokemonForm.Id} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(pokemonForm.Id, true);
            }

            return frontShinyUrl;
        }

        /// <summary>
        /// Creates and returns the URL of the sprite of the Pokemon form with the given ID.
        /// </summary>
        private string MakeSpriteUrl(int formId, bool shiny = false)
        {
            const string baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
            if (shiny)
            {
                return $"{baseUrl}/shiny/{formId}.png";
            }

            return $"{baseUrl}/{formId}.png";
        }

        /// <summary>
        /// Returns the given Pokemon form's types.
        /// </summary>
        private async Task<IEnumerable<WithId<Type[]>>> GetTypes(PokemonForm form)
        {
            var typesList = new List<WithId<Type[]>>();

            var newestTypeEntries = new List<Type>();

            // some forms have different types indicated by their names, i.e. arceus, silvally
            var allTypes = await TypesService.GetAll();
            var matchingType = allTypes.SingleOrDefault(t => t.Name == form.FormName);

            if (matchingType != null)
            {
                newestTypeEntries.Add(new Type
                {
                    Id = matchingType.TypeId,
                    Name = matchingType.Name
                });
            }
            else
            {
                // some forms' types need to be looked up...
                var formTypes = await GetFormTypesByName(form.Name);
                if (formTypes.Any())
                {
                    newestTypeEntries = formTypes.Select(t => new Type
                    {
                        Id = t.TypeId,
                        Name = t.Name
                    }).ToList();
                }
            }

            // FUTURE: anticipating a generation-based types changelog
            var newestIdWithoutData = VersionGroupsService.OldestVersionGroupId;
            var newestId = VersionGroupsService.NewestVersionGroupId;
            for (var id = newestIdWithoutData; id <= newestId; id++)
            {
                typesList.Add(new WithId<Type[]>(id, newestTypeEntries.ToArray()));
            }

            return typesList;
        }

        /// <summary>
        /// Returns the types of the Pokemon form with the given form name.
        /// </summary>
        // TODO: store this somewhere sensible
        private async Task<IEnumerable<TypeEntry>> GetFormTypesByName(string name)
        {
            IEnumerable<int> typeIds = new int[0];

            switch (name)
            {
                case "castform-sunny":
                    typeIds = new[] { 10 };
                    break;

                case "castform-rainy":
                    typeIds = new[] { 11 };
                    break;

                case "castform-snowy":
                    typeIds = new[] { 15 };
                    break;

                case "wormadam-sandy":
                    typeIds = new[] { 7, 5 };
                    break;

                case "wormadam-trash":
                    typeIds = new[] { 7, 9 };
                    break;

                case "rotom-heat":
                    typeIds = new[] { 13, 10 };
                    break;

                case "rotom-wash":
                    typeIds = new[] { 13, 11 };
                    break;

                case "rotom-frost":
                    typeIds = new[] { 13, 15 };
                    break;

                case "rotom-fan":
                    typeIds = new[] { 13, 3 };
                    break;

                case "rotom-mow":
                    typeIds = new[] { 13, 12 };
                    break;

                case "shaymin-sky":
                    typeIds = new[] { 12, 3 };
                    break;

                case "darmanitan-zen":
                    typeIds = new[] { 10, 14 };
                    break;

                case "meloetta-pirouette":
                    typeIds = new[] { 1, 2 };
                    break;

                case "groudon-primal":
                    typeIds = new[] { 5, 10 };
                    break;

                case "hoopa-unbound":
                    typeIds = new[] { 14, 17 };
                    break;

                case "rattata-alola":
                case "raticate-alola":
                case "raticate-totem-alola":
                    typeIds = new[] { 17, 1 };
                    break;

                case "raichu-alola":
                    typeIds = new[] { 13, 14 };
                    break;

                case "sandshrew-alola":
                case "sandslash-alola":
                    typeIds = new[] { 15, 9 };
                    break;

                case "vulpix-alola":
                    typeIds = new[] { 15 };
                    break;

                case "ninetales-alola":
                    typeIds = new[] { 15, 18 };
                    break;

                case "diglett-alola":
                case "dugtrio-alola":
                    typeIds = new[] { 5, 9 };
                    break;

                case "meowth-alola":
                case "persian-alola":
                    typeIds = new[] { 17 };
                    break;

                case "geodude-alola":
                case "graveler-alola":
                case "golem-alola":
                    typeIds = new[] { 6, 13 };
                    break;

                case "grimer-alola":
                case "muk-alola":
                    typeIds = new[] { 4, 17 };
                    break;

                case "exeggutor-alola":
                    typeIds = new[] { 12, 16 };
                    break;

                case "marowak-alola":
                    typeIds = new[] { 10, 8 };
                    break;

                case "oricorio-pom-pom":
                    typeIds = new[] { 13, 3 };
                    break;

                case "oricorio-pau":
                    typeIds = new[] { 14, 3 };
                    break;

                case "oricorio-sensu":
                    typeIds = new[] { 18, 3 };
                    break;

                case "necrozma-dusk":
                    typeIds = new[] { 14, 9 };
                    break;

                case "necrozma-dawn":
                    typeIds = new[] { 14, 8 };
                    break;

                case "necrozma-ultra":
                    typeIds = new[] { 14, 16 };
                    break;

                default:
                    break;
            }

            return await TypesService.UpsertMany(typeIds);
        }

        /// <summary>
        /// Returns the given Pokemon form's validity in all version groups.
        /// </summary>
        private async Task<IEnumerable<int>> GetValidity(PokemonForm pokemonForm)
        {
            var validityList = new List<int>();

            foreach (var vg in await VersionGroupsService.GetAll())
            {
                var isValid = await IsValid(pokemonForm, vg);
                if (isValid)
                {
                    // form is only valid if the version group's ID is in the list
                    validityList.Add(vg.VersionGroupId);
                }
            }

            return validityList;
        }

        /// <summary>
        /// Returns true if the given Pokemon form can be obtained in the given version group.
        /// </summary>
        private async Task<bool> IsValid(PokemonForm pokemonForm, VersionGroupEntry versionGroup)
        {
            if (pokemonForm.IsMega)
            {
                // decide based on version group in which it was introduced
                var formVersionGroup = await VersionGroupsService.Upsert(pokemonForm.VersionGroup);
                return formVersionGroup.Order <= versionGroup.Order;
            }

            return false;
        }

        #endregion
    }
}
