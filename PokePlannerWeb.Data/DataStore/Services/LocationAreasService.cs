using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the location area entries in the data store.
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
            IDataStoreSource<LocationAreaEntry> dataStoreSource,
            IPokeAPI pokeApi,
            LocationsService locationsService,
            ILogger<LocationAreasService> logger) : base(dataStoreSource, pokeApi, logger)
        {
            LocationsService = locationsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a location area entry for the given location area.
        /// </summary>
        protected override async Task<LocationAreaEntry> ConvertToEntry(LocationArea locationArea)
        {
            var displayNames = locationArea.Names.ToDisplayNames();
            var location = await GetLocation(locationArea);

            return new LocationAreaEntry
            {
                Key = locationArea.Id,
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
