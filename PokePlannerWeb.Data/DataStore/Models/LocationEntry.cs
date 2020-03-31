﻿using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a location in the data store.
    /// </summary>
    public class LocationEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets or sets the ID of the location.
        /// </summary>
        public int LocationId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the display names of the location.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}
