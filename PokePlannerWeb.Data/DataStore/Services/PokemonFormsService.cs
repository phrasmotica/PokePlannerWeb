using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon forms entries in the database.
    /// </summary>
    public class PokemonFormsService : ServiceBase<PokemonForm, int, PokemonFormsEntry>
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
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            TypesService typesService,
            VersionGroupsService versionGroupsService,
            ILogger<PokemonFormsService> logger) : base(settings, pokeApi, logger)
        {
            VersionGroupsService = versionGroupsService;
            TypesService = typesService;
        }

        /// <summary>
        /// Creates a connection to the Pokemon forms collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<PokemonFormsEntry>(settings.PokemonFormsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon forms entry with the given ID from the database.
        /// </summary>
        protected override PokemonFormsEntry Get(int pokemonId)
        {
            return Collection.Find(p => p.FormId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon forms entry in the database and returns it.
        /// </summary>
        protected override PokemonFormsEntry Create(PokemonFormsEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon forms entry with the given ID from the database.
        /// </summary>
        protected override void Remove(int pokemonId)
        {
            Collection.DeleteOne(p => p.FormId == pokemonId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<PokemonForm> FetchSource(int pokemonId)
        {
            Logger.LogInformation($"Fetching Pokemon form source object with ID {pokemonId}...");
            return await PokeApi.Get<PokemonForm>(pokemonId);
        }

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonFormsEntry> ConvertToEntry(PokemonForm pokemonForm)
        {
            var types = await GetTypes(pokemonForm);

            return new PokemonFormsEntry
            {
                FormId = pokemonForm.Id,
                Name = pokemonForm.Name,
                FormName = pokemonForm.FormName,
                DisplayNames = pokemonForm.GetDisplayNames().ToList(),
                SpriteUrl = GetSpriteUrl(pokemonForm),
                ShinySpriteUrl = GetShinySpriteUrl(pokemonForm),
                Types = types.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the Pokemon form with the given ID from the data store.
        /// </summary>
        public async Task<PokemonFormsEntry> GetPokemonForm(int formId)
        {
            return await GetOrCreate(formId);
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
            // TODO: some forms don't do this...
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

            // FUTURE: anticipating a generation-based types changelog
            var newestIdWithoutData = VersionGroupsService.OldestVersionGroupId;
            var newestId = VersionGroupsService.NewestVersionGroupId;
            for (var id = newestIdWithoutData; id <= newestId; id++)
            {
                typesList.Add(new WithId<Type[]>(id, newestTypeEntries.ToArray()));
            }

            return typesList;
        }

        #endregion
    }
}
