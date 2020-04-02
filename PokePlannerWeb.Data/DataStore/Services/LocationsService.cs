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
    /// Service for managing the location entries in the data store.
    /// </summary>
    public class LocationsService : NamedApiResourceServiceBase<Location, LocationEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationsService(
            IDataStoreSource<LocationEntry> dataStoreSource,
            IPokeAPI pokeApi,
            ILogger<LocationsService> logger) : base(dataStoreSource, pokeApi, logger)
        {
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a location entry for the given location.
        /// </summary>
        protected override Task<LocationEntry> ConvertToEntry(Location location)
        {
            var displayNames = location.Names.ToDisplayNames();

            return Task.FromResult(new LocationEntry
            {
                Key = location.Id,
                Name = location.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion
    }
}
