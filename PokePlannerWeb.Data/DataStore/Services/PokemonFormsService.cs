using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;
using Pokemon = PokeApiNet.Models.Pokemon;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon forms entries in the database.
    /// </summary>
    public class PokemonFormsService
    {
        /// <summary>
        /// The collection of Pokemon forms.
        /// </summary>
        private readonly IMongoCollection<PokemonFormsEntry> PokemonFormsCollection;

        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<PokemonFormsService> Logger;

        /// <summary>
        /// Creates a connection to the Pokemon forms collection in the database.
        /// </summary>
        public PokemonFormsService(IPokePlannerWebDbSettings settings, ILogger<PokemonFormsService> logger)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            PokemonFormsCollection = database.GetCollection<PokemonFormsEntry>(settings.PokemonFormsCollectionName);
            Logger = logger;
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon forms entry with the given ID from the database.
        /// </summary>
        public PokemonFormsEntry Get(int pokemonId)
        {
            return PokemonFormsCollection.Find(p => p.PokemonId == pokemonId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon forms entry in the database and returns it.
        /// </summary>
        public PokemonFormsEntry Create(PokemonFormsEntry entry)
        {
            PokemonFormsCollection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Replaces the Pokemon forms entry with the given ID with a new entry in the database.
        /// </summary>
        public void Update(int pokemonId, PokemonFormsEntry entry)
        {
            PokemonFormsCollection.ReplaceOne(p => p.PokemonId == pokemonId, entry);
        }

        /// <summary>
        /// Removes the Pokemon forms entry with the given ID from the database.
        /// </summary>
        public void Remove(int pokemonId)
        {
            PokemonFormsCollection.DeleteOne(p => p.PokemonId == pokemonId);
        }

        #endregion

        /// <summary>
        /// Returns the Pokemon with the given ID from the database, creating an entry for it if it
        /// doesn't exist.
        /// </summary>
        public async Task<PokemonFormsEntry> GetOrCreate(int pokemonId)
        {
            var entry = Get(pokemonId);
            if (entry == null)
            {
                Logger.LogInformation($"Creating forms entry for Pokemon {pokemonId} in database...");

                // get from PokeAPI
                var pokemon = await PokeAPI.Get<Pokemon>(pokemonId);

                // store in database
                entry = await CreateEntry(pokemon);
            }

            // TODO: update entry if it's exceeded its TTL

            return entry;
        }

        /// <summary>
        /// Creates a new Pokemon forms entry in the database and returns it.
        /// </summary>
        public async Task<PokemonFormsEntry> CreateEntry(Pokemon pokemon)
        {
            var entry = await ConvertToEntry(pokemon);
            return Create(entry);
        }

        /// <summary>
        /// Returns the display names of the forms of the Pokemon with the given ID in the given
        /// locale from the data store.
        /// </summary>
        public IEnumerable<string> GetFormDisplayNames(int pokemonId, string locale = "en")
        {
            var entry = Get(pokemonId);
            return entry.GetFormDisplayNames(locale);
        }

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        private async Task<PokemonFormsEntry> ConvertToEntry(Pokemon pokemon)
        {
            var formResources = await PokeAPI.Get(pokemon.Forms);
            var forms = formResources.Select(f =>
            {
                var displayNames = f.Names.Select(n => new DisplayName
                {
                    Language = n.Language.Name,
                    Name = n.Name
                }).ToList();

                return new PokemonForm
                {
                    FormId = f.Id,
                    DisplayNames = displayNames
                };
            }).ToList();

            return new PokemonFormsEntry
            {
                PokemonId = pokemon.Id,
                Forms = forms
            };
        }
    }
}
