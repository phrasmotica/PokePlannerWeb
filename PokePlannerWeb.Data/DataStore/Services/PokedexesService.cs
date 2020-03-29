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
    /// Service for managing the pokedex entries in the database.
    /// </summary>
    public class PokedexesService : ServiceBase<Pokedex, int, PokedexEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokedexesService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<PokedexesService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the pokedex collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<PokedexEntry>(settings.PokedexesCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the pokedex with the given ID from the database.
        /// </summary>
        protected override PokedexEntry Get(int pokedexId)
        {
            return Collection.Find(p => p.PokedexId == pokedexId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new pokedex in the database and returns it.
        /// </summary>
        protected override PokedexEntry Create(PokedexEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the pokedex with the given ID from the database.
        /// </summary>
        protected override void Remove(int pokedexId)
        {
            Collection.DeleteOne(v => v.PokedexId == pokedexId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the version with the given ID.
        /// </summary>
        protected override async Task<Pokedex> FetchSource(int pokedexId)
        {
            Logger.LogInformation($"Fetching pokedex source object with ID {pokedexId}...");
            return await PokeApi.Get<Pokedex>(pokedexId);
        }

        /// <summary>
        /// Returns a version entry for the given version.
        /// </summary>
        protected override Task<PokedexEntry> ConvertToEntry(Pokedex pokedex)
        {
            var displayNames = pokedex.Names.ToDisplayNames();

            return Task.FromResult(new PokedexEntry
            {
                PokedexId = pokedex.Id,
                Name = pokedex.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all pokedexes.
        /// </summary>
        public async Task<PokedexEntry[]> GetAll()
        {
            var allPokedexes = await UpsertAll();
            return allPokedexes.ToArray();
        }

        #endregion
    }
}
