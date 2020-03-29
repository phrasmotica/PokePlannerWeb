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
    /// Service for managing the generation entries in the database.
    /// </summary>
    public class GenerationsService : ServiceBase<Generation, int, GenerationEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public GenerationsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<GenerationsService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the generations collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<GenerationEntry>(settings.GenerationsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the generation with the given ID from the database.
        /// </summary>
        protected override GenerationEntry Get(int generationId)
        {
            return Collection.Find(p => p.GenerationId == generationId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new generation in the database and returns it.
        /// </summary>
        protected override GenerationEntry Create(GenerationEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the generation with the given ID from the database.
        /// </summary>
        protected override void Remove(int generationId)
        {
            Collection.DeleteOne(p => p.GenerationId == generationId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Type with the given ID.
        /// </summary>
        protected override async Task<Generation> FetchSource(int generationId)
        {
            Logger.LogInformation($"Fetching generation source object with ID {generationId}...");
            return await PokeApi.Get<Generation>(generationId);
        }

        /// <summary>
        /// Returns a Type entry for the given Type.
        /// </summary>
        protected override Task<GenerationEntry> ConvertToEntry(Generation generation)
        {
            var displayNames = generation.Names.ToDisplayNames();

            return Task.FromResult(new GenerationEntry
            {
                GenerationId = generation.Id,
                Name = generation.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all generations.
        /// </summary>
        public async Task<GenerationEntry[]> GetAll()
        {
            var allGenerations = await UpsertAll();
            return allGenerations.ToArray();
        }

        /// <summary>
        /// Returns the generation of the given version group.
        /// </summary>
        public async Task<GenerationEntry> GetByVersionGroup(VersionGroup versionGroup)
        {
            return await Upsert(versionGroup.Generation);
        }

        #endregion
    }
}
