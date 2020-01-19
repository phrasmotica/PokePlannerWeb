using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;
using Pokemon = PokeApiNet.Models.Pokemon;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon entries in the database.
    /// </summary>
    public class PokemonService : ServiceBase<Pokemon, PokemonEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonService(IPokePlannerWebDbSettings settings, ILogger<PokemonService> logger) : base(settings, logger)
        {
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
        /// Replaces the Pokemon with the given ID with a new Pokemon in the database.
        /// </summary>
        public override void Update(int pokemonId, PokemonEntry entry)
        {
            Collection.ReplaceOne(p => p.PokemonId == pokemonId, entry);
        }

        /// <summary>
        /// Removes the Pokemon with the given ID from the database.
        /// </summary>
        public override void Remove(int pokemonId)
        {
            Collection.DeleteOne(p => p.PokemonId == pokemonId);
        }

        #endregion

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<Pokemon> FetchSource(int pokemonId)
        {
            return await PokeAPI.Get<Pokemon>(pokemonId);
        }

        /// <summary>
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
        {
            // get names from species resource
            var species = await PokeAPI.Get(pokemon.Species);
            var displayNames = species.Names.Select(n => new DisplayName { Language = n.Language.Name, Name = n.Name }).ToList();

            return new PokemonEntry
            {
                PokemonId = pokemon.Id,
                DisplayNames = displayNames
            };
        }

        /// <summary>
        /// Returns the display name of the Pokemon with the given ID in the given locale from the
        /// data store.
        /// </summary>
        public string GetPokemonDisplayName(int pokemonId, string locale = "en")
        {
            var entry = Get(pokemonId);
            return entry.GetDisplayName(locale);
        }
    }
}
