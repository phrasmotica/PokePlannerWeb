using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a generation in the data store.
    /// </summary>
    public class GenerationEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets or sets the ID of the generation.
        /// </summary>
        public int GenerationId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the display names of the generation.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}
