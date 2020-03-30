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
    /// Service for managing the location entries in the database.
    /// </summary>
    public class LocationsService : ServiceBase<Location, int, LocationEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationsService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            ILogger<LocationsService> logger) : base(settings, pokeApi, logger)
        {
        }

        /// <summary>
        /// Creates a connection to the locations collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<LocationEntry>(settings.LocationsCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the location with the given ID from the database.
        /// </summary>
        protected override LocationEntry Get(int locationId)
        {
            return Collection.Find(p => p.LocationId == locationId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new location in the database and returns it.
        /// </summary>
        protected override LocationEntry Create(LocationEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the location with the given ID from the database.
        /// </summary>
        protected override void Remove(int locationId)
        {
            Collection.DeleteOne(p => p.LocationId == locationId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the location with the given ID.
        /// </summary>
        protected override async Task<Location> FetchSource(int generationId)
        {
            Logger.LogInformation($"Fetching location source object with ID {generationId}...");
            return await PokeApi.Get<Location>(generationId);
        }

        /// <summary>
        /// Returns a location entry for the given location.
        /// </summary>
        protected override Task<LocationEntry> ConvertToEntry(Location location)
        {
            var displayNames = location.Names.ToDisplayNames();

            return Task.FromResult(new LocationEntry
            {
                LocationId = location.Id,
                Name = location.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion
    }
}
