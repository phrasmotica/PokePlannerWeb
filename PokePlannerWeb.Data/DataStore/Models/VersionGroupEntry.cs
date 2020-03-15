using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a version group in the data store.
    /// </summary>
    public class VersionGroupEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the version group.
        /// </summary>
        public int VersionGroupId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the display names of the version group.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}
