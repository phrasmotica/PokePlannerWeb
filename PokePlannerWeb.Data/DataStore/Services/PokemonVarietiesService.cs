using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon varieties entries in the database.
    /// </summary>
    public class PokemonVarietiesService : ServiceBase<PokemonSpecies, PokemonVarietiesEntry>
    {
        /// <summary>
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonVarietiesService(
            IPokePlannerWebDbSettings settings,
            PokemonService pokemonService,
            ILogger<PokemonVarietiesService> logger
        ) : base(settings, logger)
        {
            PokemonService = pokemonService;
        }

        /// <summary>
        /// Creates a connection to the Pokemon varieties collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<PokemonVarietiesEntry>(settings.PokemonVarietiesCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon varieties entry with the given ID from the database.
        /// </summary>
        public override PokemonVarietiesEntry Get(int speciesId)
        {
            return Collection.Find(p => p.SpeciesId == speciesId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon varieties entry in the database and returns it.
        /// </summary>
        public override PokemonVarietiesEntry Create(PokemonVarietiesEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon varieties entry with the given ID from the database.
        /// </summary>
        public override void Remove(int speciesId)
        {
            Collection.DeleteOne(p => p.SpeciesId == speciesId);
        }

        #endregion

        /// <summary>
        /// Returns the Pokemon species with the given ID.
        /// </summary>
        protected override async Task<PokemonSpecies> FetchSource(int speciesId)
        {
            return await PokeAPI.Get<PokemonSpecies>(speciesId);
        }

        /// <summary>
        /// Returns a Pokemon varieties entry for the given Pokemon species.
        /// </summary>
        protected override async Task<PokemonVarietiesEntry> ConvertToEntry(PokemonSpecies species)
        {
            var varietyResources = await PokeAPI.Get(species.Varieties.Select(v => v.Pokemon));
            var varieties = new List<PokemonVariety>();

            foreach (var v in varietyResources)
            {
                var pokemonEntry = await PokemonService.GetOrCreate(v.Id);
                var displayNames = pokemonEntry.DisplayNames;

                varieties.Add(new PokemonVariety
                {
                    PokemonId = v.Id,
                    DisplayNames = displayNames
                });
            }

            return new PokemonVarietiesEntry
            {
                SpeciesId = species.Id,
                Varieties = varieties
            };
        }
    }
}
