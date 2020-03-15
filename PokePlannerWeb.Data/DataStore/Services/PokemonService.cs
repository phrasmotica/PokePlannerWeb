using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;
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
        /// The version group data singleton.
        /// </summary>
        private readonly VersionGroupData VersionGroupData;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            VersionGroupData versionGroupData,
            ILogger<PokemonService> logger) : base(settings, pokeApi, logger)
        {
            VersionGroupData = versionGroupData;
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
        public override PokemonEntry Get(int pokemonId)
        {
            return Collection.Find(p => p.PokemonId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon in the database and returns it.
        /// </summary>
        public override PokemonEntry Create(PokemonEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon with the given ID from the database.
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
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
        {
            var displayNames = await GetDisplayNames(pokemon);
            var validity = await GetValidity(pokemon);

            return new PokemonEntry
            {
                PokemonId = pokemon.Id,
                DisplayNames = displayNames.ToList(),
                SpriteUrl = GetSpriteUrl(pokemon),
                ShinySpriteUrl = GetShinySpriteUrl(pokemon),
                Types = GetTypes(pokemon),
                BaseStats = GetBaseStats(pokemon),
                Validity = validity
            };
        }

        #endregion

        #region Public methods

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
        public async Task<string[]> GetPokemonTypesInVersionGroup(int pokemonId, int versionGroupId)
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
            var form = await PokeApi.Get(pokemon.Forms[0]);
            if (string.IsNullOrEmpty(form.FormName))
            {
                // form has empty form_name if it's the standard form
                var species = await PokeApi.Get(pokemon.Species);
                return species.Names.ToDisplayNames().ToList();
            }

            // use names of secondary form
            return form.Names.ToDisplayNames().ToList();
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
        /// Returns the types of the given Pokemon in all version groups.
        /// </summary>
        private List<WithId<string[]>> GetTypes(Pokemon pokemon)
        {
            var typesList = new List<WithId<string[]>>();

            var newestIdWithoutData = VersionGroupData.OldestVersionGroupId;

            if (pokemon.PastTypes != null)
            {
                foreach (var vg in VersionGroupData.VersionGroups)
                {
                    var types = pokemon.PastTypes.FirstOrDefault(t => t.Generation.Name == vg.Generation.Name);
                    if (types != null)
                    {
                        var typeNames = types.Types.ToNames().ToArray();
                        for (var id = newestIdWithoutData; id <= vg.Id; id++)
                        {
                            typesList.Add(new WithId<string[]>(id, typeNames));
                        }

                        newestIdWithoutData = vg.Id + 1;
                    }
                }
            }

            // always include the newest types
            var newestId = VersionGroupData.NewestVersionGroupId;
            var newestTypeNames = pokemon.Types.ToNames().ToArray();
            for (var id = newestIdWithoutData; id <= newestId; id++)
            {
                typesList.Add(new WithId<string[]>(id, newestTypeNames));
            }

            return typesList;
        }

        /// <summary>
        /// Returns the base stats of the given Pokemon.
        /// </summary>
        private List<WithId<int[]>> GetBaseStats(Pokemon pokemon)
        {
            // FUTURE: anticipating a generation-based base stats changelog
            // in which case this method will need to look like GetTypes()
            var newestId = VersionGroupData.NewestVersionGroupId;
            var currentBaseStats = pokemon.GetBaseStats(newestId);

            var statsList = VersionGroupData.VersionGroups.Select(
                vg => new WithId<int[]>(vg.Id, currentBaseStats)
            );

            return statsList.ToList();
        }

        /// <summary>
        /// Returns the given Pokemon's validity in all version groups.
        /// </summary>
        private async Task<List<WithId<bool>>> GetValidity(Pokemon pokemon)
        {
            var validityList = new List<WithId<bool>>();

            foreach (var vg in VersionGroupData.VersionGroups)
            {
                var isValid = await IsValid(pokemon, vg);
                validityList.Add(new WithId<bool>(vg.Id, isValid));
            }

            return validityList;
        }

        /// <summary>
        /// Returns true if the given Pokemon can be obtained in the given version group.
        /// </summary>
        private async Task<bool> IsValid(Pokemon pokemon, VersionGroup versionGroup)
        {
            var form = await PokeApi.Get(pokemon.Forms[0]);
            if (form.IsMega)
            {
                // decide based on version group in which it was introduced
                var formVersionGroup = await PokeApi.Get(form.VersionGroup);
                return formVersionGroup.Order <= versionGroup.Order;
            }

            var pokemonSpecies = await PokeApi.Get(pokemon.Species);
            return IsValid(pokemonSpecies, versionGroup);
        }

        /// <summary>
        /// Returns true if the given Pokemon species can be obtained in the given version group.
        /// </summary>
        private bool IsValid(PokemonSpecies pokemonSpecies, VersionGroup versionGroup)
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
