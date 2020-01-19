using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using Pokemon = PokeApiNet.Models.Pokemon;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon forms entries in the database.
    /// </summary>
    public class PokemonFormsService : ServiceBase<Pokemon, PokemonFormsEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonFormsService(IPokePlannerWebDbSettings settings, ILogger<PokemonFormsService> logger) : base(settings, logger)
        {
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

        /// <summary>
        /// Returns the Pokemon with the given ID.
        /// </summary>
        protected override async Task<Pokemon> FetchSource(int pokemonId)
        {
            return await PokeAPI.Get<Pokemon>(pokemonId);
        }

        /// <summary>
        /// Returns a Pokemon forms entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonFormsEntry> ConvertToEntry(Pokemon pokemon)
        {
            var formResources = await PokeAPI.Get(pokemon.Forms);
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

        /// <summary>
        /// Returns the display names of the forms of the Pokemon with the given ID in the given
        /// locale from the data store.
        /// </summary>
        public IEnumerable<string> GetFormDisplayNames(int pokemonId, string locale = "en")
        {
            var entry = Get(pokemonId);
            return entry.GetFormDisplayNames(locale);
        }
    }
}
