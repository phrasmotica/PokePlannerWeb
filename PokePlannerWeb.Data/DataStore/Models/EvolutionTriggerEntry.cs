using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a evolution trigger in the data store.
    /// </summary>
    public class EvolutionTriggerEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the evolution trigger.
        /// </summary>
        public int EvolutionTriggerId => Key;

        /// <summary>
        /// Gets or sets the display names of the evolution trigger.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }
    }
}
