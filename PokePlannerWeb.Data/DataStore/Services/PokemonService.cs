using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;
using Pokemon = PokeApiNet.Models.Pokemon;

namespace PokePlannerWeb.Data.DataStore.Services
{
    public class PokemonService
    {
        /// <summary>
        /// The collection of Pokemon.
        /// </summary>
        private readonly IMongoCollection<PokemonEntry> PokemonCollection;

        /// <summary>
        /// Creates a connection to the Pokemon collection in the database.
        /// </summary>
        public PokemonService(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            PokemonCollection = database.GetCollection<PokemonEntry>(settings.PokemonCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the database.
        /// </summary>
        public PokemonEntry Get(int pokemonId)
        {
            return PokemonCollection.Find(p => p.PokemonId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon in the database and returns it.
        /// </summary>
        public PokemonEntry Create(PokemonEntry entry)
        {
            PokemonCollection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Replaces the Pokemon with the given ID with a new Pokemon in the database.
        /// </summary>
        public void Update(int pokemonId, PokemonEntry entry)
        {
            PokemonCollection.ReplaceOne(p => p.PokemonId == pokemonId, entry);
        }

        /// <summary>
        /// Removes the Pokemon with the given ID from the database.
        /// </summary>
        public void Remove(int pokemonId)
        {
            PokemonCollection.DeleteOne(p => p.PokemonId == pokemonId);
        }

        #endregion

        /// <summary>
        /// Creates a new Pokemon in the database and returns it.
        /// </summary>
        public async Task<PokemonEntry> CreateEntry(Pokemon pokemon)
        {
            var entry = await ConvertToEntry(pokemon);
            return Create(entry);
        }

        /// <summary>
        /// Returns the display name of the Pokemon with the given ID in the given locale from the
        /// data store.
        /// </summary>
        public string GetPokemonDisplayName(int pokemonId, string locale = "en")
        {
            var entry = Get(pokemonId);
            return entry.DisplayNames.SingleOrDefault(n => n.Language == locale).Name;
        }

        /// <summary>
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        private async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
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
    }
}
