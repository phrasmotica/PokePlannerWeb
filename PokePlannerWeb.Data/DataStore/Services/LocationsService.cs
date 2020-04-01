using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the location entries in the database.
    /// </summary>
    public class LocationsService : NamedApiResourceServiceBase<Location, LocationEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationsService(
            ICacheSource<LocationEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<LocationsService> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region CRUD methods

        /// <summary>
        /// Returns the location with the given ID from the database.
        /// </summary>
        protected override LocationEntry Get(int locationId)
        {
            return CacheSource.GetOne(l => l.LocationId == locationId);
        }

        /// <summary>
        /// Removes the location with the given ID from the database.
        /// </summary>
        protected override void Remove(int locationId)
        {
            CacheSource.DeleteOne(l => l.LocationId == locationId);
        }

        #endregion

        #region Entry conversion methods

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
