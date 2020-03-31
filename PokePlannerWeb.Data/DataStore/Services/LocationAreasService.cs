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
    /// Service for managing the location area entries in the database.
    /// </summary>
    public class LocationAreasService : NamedApiResourceServiceBase<LocationArea, LocationAreaEntry>
    {
        /// <summary>
        /// The locations service.
        /// </summary>
        private readonly LocationsService LocationsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationAreasService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            LocationsService locationsService,
            ILogger<LocationAreasService> logger) : base(settings, pokeApi, logger)
        {
            LocationsService = locationsService;
        }

        /// <summary>
        /// Creates a connection to the location areas collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<LocationAreaEntry>(settings.LocationAreasCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the location area with the given ID from the database.
        /// </summary>
        protected override LocationAreaEntry Get(int locationId)
        {
            return Collection.Find(p => p.LocationAreaId == locationId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new location area in the database and returns it.
        /// </summary>
        protected override LocationAreaEntry Create(LocationAreaEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the location area with the given ID from the database.
        /// </summary>
        protected override void Remove(int locationId)
        {
            Collection.DeleteOne(p => p.LocationAreaId == locationId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the location area with the given ID.
        /// </summary>
        protected override async Task<LocationArea> FetchSource(int generationId)
        {
            Logger.LogInformation($"Fetching location area source object with ID {generationId}...");
            return await PokeApi.Get<LocationArea>(generationId);
        }

        /// <summary>
        /// Returns a location area entry for the given location area.
        /// </summary>
        protected override async Task<LocationAreaEntry> ConvertToEntry(LocationArea locationArea)
        {
            var displayNames = locationArea.Names.ToDisplayNames();
            var location = await GetLocation(locationArea);

            return new LocationAreaEntry
            {
                LocationAreaId = locationArea.Id,
                Name = locationArea.Name,
                DisplayNames = displayNames.ToList(),
                Location = new Location
                {
                    Id = location.LocationId,
                    Name = location.Name
                }
            };
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the location of the location area.
        /// </summary>
        private async Task<LocationEntry> GetLocation(LocationArea locationArea)
        {
            return await LocationsService.Upsert(locationArea.Location);
        }

        #endregion
    }
}
