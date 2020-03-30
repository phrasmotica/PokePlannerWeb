using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a location area in the data store.
    /// </summary>
    public class LocationAreaEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the location area.
        /// </summary>
        public int LocationAreaId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the location area.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the display names of the location area.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the location of the location area.
        /// </summary>
        public Location Location { get; set; }
    }
}
