using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using Pokemon = PokeApiNet.Pokemon;
using PokemonEntry = PokePlannerWeb.Data.DataStore.Models.PokemonEntry;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon entries in the database.
    /// </summary>
    public class PokemonService : ServiceBase<Pokemon, int, PokemonEntry>
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
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            PokemonFormsService pokemonFormsService,
            TypesService typesService,
            VersionGroupsService versionGroupsService,
            ILogger<PokemonService> logger) : base(settings, pokeApi, logger)
        {
            PokemonFormsService = pokemonFormsService;
            TypesService = typesService;
            VersionGroupsService = versionGroupsService;
        }

        /// <summary>
        /// Creates a connection to the Pokemon collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<PokemonEntry>(settings.PokemonCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the database.
        /// </summary>
        protected override PokemonEntry Get(int pokemonId)
        {
            return Collection.Find(p => p.PokemonId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon in the database and returns it.
        /// </summary>
        protected override PokemonEntry Create(PokemonEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon with the given ID from the database.
        /// </summary>
        protected override void Remove(int pokemonId)
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
            Logger.LogInformation($"Fetching Pokemon source object with ID {pokemonId}...");
            return await PokeApi.Get<Pokemon>(pokemonId);
        }

        /// <summary>
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
        {
            var displayNames = await GetDisplayNames(pokemon);
            var forms = await GetForms(pokemon);
            var types = await GetTypes(pokemon);
            var baseStats = await GetBaseStats(pokemon);
            var validity = await GetValidity(pokemon);

            return new PokemonEntry
            {
                PokemonId = pokemon.Id,
                Name = pokemon.Name,
                DisplayNames = displayNames.ToList(),
                SpriteUrl = GetSpriteUrl(pokemon),
                ShinySpriteUrl = GetShinySpriteUrl(pokemon),
                Forms = forms.ToList(),
                Types = types,
                BaseStats = baseStats,
                Validity = validity
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the data store.
        /// </summary>
        public async Task<PokemonEntry> GetPokemon(int pokemonId)
        {
            return await GetOrCreate(pokemonId);
        }

        /// <summary>
        /// Returns the Pokemon forms of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<PokemonFormEntry[]> GetPokemonForms(int pokemonId, int versionGroupId)
        {
            var entry = await GetOrCreate(pokemonId);
            var formEntries = await PokemonFormsService.GetOrCreateMany(entry.Forms.Select(f => f.Id));
            return formEntries.ToArray();
        }

        /// <summary>
        /// Returns the display name of the Pokemon with the given ID in the given locale from the
        /// data store.
        /// </summary>
        public async Task<string> GetPokemonDisplayName(int pokemonId, string locale = "en")
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.GetDisplayName(locale);
        }

        /// <summary>
        /// Returns the front default sprite URL of the Pokemon with the given ID from the data store.
        /// </summary>
        public async Task<string> GetPokemonSpriteUrl(int pokemonId)
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.SpriteUrl;
        }

        /// <summary>
        /// Returns the front shiny sprite URL of the Pokemon with the given ID from the data store.
        /// </summary>
        public async Task<string> GetPokemonShinySpriteUrl(int pokemonId)
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.ShinySpriteUrl;
        }

        /// <summary>
        /// Returns the types of the Pokemon with the given ID in the version group with the given
        /// ID from the data store.
        /// </summary>
        public async Task<Type[]> GetPokemonTypesInVersionGroup(int pokemonId, int versionGroupId)
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.GetTypes(versionGroupId);
        }

        /// <summary>
        /// Returns the base stats of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<int[]> GetPokemonBaseStatsInVersionGroup(int pokemonId, int versionGroupId)
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.GetBaseStats(versionGroupId);
        }

        /// <summary>
        /// Returns the validity of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<bool> GetPokemonValidityInVersionGroup(int pokemonId, int versionGroupId)
        {
            var entry = await GetOrCreate(pokemonId);
            return entry.GetValidity(versionGroupId);
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns this Pokemon's display names.
        /// </summary>
        private async Task<IEnumerable<DisplayName>> GetDisplayNames(Pokemon pokemon)
        {
            var form = await PokemonFormsService.Upsert(pokemon.Forms[0]);
            if (string.IsNullOrEmpty(form.FormName))
            {
                // form has empty form_name if it's the standard form
                // so use names of species
                return Enumerable.Empty<DisplayName>();
            }

            // use names of secondary form
            return form.DisplayNames;
        }

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
                        // TODO: cache type names to IDs somewhere in an efficient way...
                        // ...maybe create a generic named resource names to IDs cache
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

        /// <summary>
        /// Returns the given Pokemon's validity in all version groups.
        /// </summary>
        private async Task<List<WithId<bool>>> GetValidity(Pokemon pokemon)
        {
            var validityList = new List<WithId<bool>>();

            foreach (var vg in await VersionGroupsService.GetAll())
            {
                var isValid = await IsValid(pokemon, vg);
                validityList.Add(new WithId<bool>(vg.VersionGroupId, isValid));
            }

            return validityList;
        }

        /// <summary>
        /// Returns true if the given Pokemon can be obtained in the given version group.
        /// </summary>
        private async Task<bool> IsValid(Pokemon pokemon, VersionGroupEntry versionGroup)
        {
            var form = await PokemonFormsService.Upsert(pokemon.Forms[0]);
            if (form.IsMega)
            {
                // decide based on version group in which it was introduced
                var formVersionGroup = await VersionGroupsService.GetOrCreate(form.VersionGroup.Id);
                return formVersionGroup.Order <= versionGroup.Order;
            }

            var pokemonSpecies = await PokeApi.Get(pokemon.Species);
            return IsValid(pokemonSpecies, versionGroup);
        }

        /// <summary>
        /// Returns true if the given Pokemon species can be obtained in the given version group.
        /// </summary>
        private bool IsValid(PokemonSpecies pokemonSpecies, VersionGroupEntry versionGroup)
        {
            if (!versionGroup.Pokedexes.Any() || !pokemonSpecies.PokedexNumbers.Any())
            {
                // PokeAPI data is incomplete
                return true;
            }

            var versionGroupPokedexes = versionGroup.Pokedexes.Select(p => p.Name);
            var pokemonPokedexes = pokemonSpecies.PokedexNumbers.Select(pn => pn.Pokedex.Name);
            return versionGroupPokedexes.Intersect(pokemonPokedexes).Any();
        }

        #endregion
    }
}
