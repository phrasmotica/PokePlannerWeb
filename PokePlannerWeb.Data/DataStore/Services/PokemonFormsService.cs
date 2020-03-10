using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Types;
using Pokemon = PokeApiNet.Pokemon;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon forms entries in the database.
    /// </summary>
    public class PokemonFormsService : ServiceBase<Pokemon, int, PokemonFormsEntry>
    {
        /// <summary>
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonFormsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            PokemonService pokemonService,
            ILogger<PokemonFormsService> logger) : base(settings, pokeApi, logger)
        {
            PokemonService = pokemonService;
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
        public override PokemonFormsEntry Get(int pokemonId)
        {
            return Collection.Find(p => p.PokemonId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon forms entry in the database and returns it.
        /// </summary>
        public override PokemonFormsEntry Create(PokemonFormsEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon forms entry with the given ID from the database.
        /// </summary>
        public override void Remove(int pokemonId)
        {
            Collection.DeleteOne(p => p.PokemonId == pokemonId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<Pokemon> FetchSource(int pokemonId)
        {
            return await PokeApi.Get<Pokemon>(pokemonId);
        }

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonFormsEntry> ConvertToEntry(Pokemon pokemon)
        {
            var formResources = await PokeApi.Get(pokemon.Forms);
            var forms = formResources.Select(f =>
            {
                return new PokemonForm
                {
                    FormId = f.Id,
                    DisplayNames = f.Names.ToDisplayNames().ToList()
                };
            }).ToList();

            return new PokemonFormsEntry
            {
                PokemonId = pokemon.Id,
                Forms = forms
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the display names of the forms of the Pokemon with the given ID in the given
        /// locale from the data store.
        /// </summary>
        public async Task<IEnumerable<string>> GetFormDisplayNames(int pokemonId, string locale = "en")
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.GetFormDisplayNames(locale);
        }

        /// <summary>
        /// Returns the display name of the Pokemon form with the given ID in the given locale.
        /// </summary>
        public async Task<string> GetFormDisplayName(int formId, string locale = "en")
        {
            var form = await PokeApi.Get<PokeApiNet.PokemonForm>(formId);
            return form.Names.GetName(locale);
        }

        /// <summary>
        /// Returns the front default sprite URL of the Pokemon form with the given ID.
        /// </summary>
        public async Task<string> GetFormSpriteUrl(int formId)
        {
            var form = await PokeApi.Get<PokeApiNet.PokemonForm>(formId);
            var frontDefaultUrl = form.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Front default sprite URL for Pokemon form {formId} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(formId);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the front shiny sprite URL of the Pokemon form with the given ID.
        /// </summary>
        public async Task<string> GetFormShinySpriteUrl(int formId)
        {
            var form = await PokeApi.Get<PokeApiNet.PokemonForm>(formId);
            var frontDefaultUrl = form.Sprites.FrontShiny;
            if (frontDefaultUrl == null)
            {
                Logger.LogInformation($"Front shint sprite URL for Pokemon form {formId} missing from PokeAPI, creating URL manually");
                return MakeSpriteUrl(formId);
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the types of the Pokemon form with the given ID in the version group with the
        /// given ID.
        /// </summary>
        public async Task<string[]> GetFormTypesInVersionGroup(int formId, int versionGroupId)
        {
            var form = await PokeApi.Get<PokeApiNet.PokemonForm>(formId);
            var types = await GetTypes(form, versionGroupId);
            return types.ToArray();
        }

        #endregion

        #region Helpers

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
        /// Returns the given Pokemon form's types in the version group with the given ID.
        /// </summary>
        private async Task<IEnumerable<string>> GetTypes(PokeApiNet.PokemonForm form, int versionGroupId)
        {
            // some forms have different types indicated by their names, i.e. arceus, silvally
            var typeNames = TypeData.AllTypes.Select(n => n.ToString().ToLower());
            if (typeNames.Contains(form.FormName))
            {
                return new[] { form.FormName };
            }

            // else get types from underlying Pokemon
            var pokemon = await PokeApi.Get(form.Pokemon);
            return await PokemonService.GetPokemonTypesInVersionGroup(pokemon.Id, versionGroupId);
        }

        #endregion
    }
}
