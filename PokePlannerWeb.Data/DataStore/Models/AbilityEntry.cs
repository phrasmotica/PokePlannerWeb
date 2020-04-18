using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents an ability in the data store.
    /// </summary>
    public class AbilityEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the ability.
        /// </summary>
        public int AbilityId => Key;

        /// <summary>
        /// Gets or sets the display names of the ability.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }
    }
}
