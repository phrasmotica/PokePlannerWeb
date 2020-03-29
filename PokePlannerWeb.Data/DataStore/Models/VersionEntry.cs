using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a version in the data store.
    /// </summary>
    public class VersionEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the version.
        /// </summary>
        public int VersionId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the version.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the display names of the version.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}
