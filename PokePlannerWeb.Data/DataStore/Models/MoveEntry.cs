using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a move in the data store.
    /// </summary>
    public class MoveEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the move.
        /// </summary>
        public int MoveId => Key;

        /// <summary>
        /// Gets or sets the display names of the move.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }
    }
}
