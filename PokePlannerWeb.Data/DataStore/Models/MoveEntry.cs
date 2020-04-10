using System.Collections.Generic;
using PokeApiNet;

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
        public List<LocalString> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the type of the move.
        /// </summary>
        public Type Type { get; set; }

        /// <summary>
        /// Gets or sets the category of the move.
        /// </summary>
        public MoveCategory Category { get; set; }

        /// <summary>
        /// Gets or sets the move's base power.
        /// </summary>
        public int? Power { get; set; }

        /// <summary>
        /// Gets or sets the damage class of the move.
        /// </summary>
        public MoveDamageClass DamageClass { get; set; }

        /// <summary>
        /// Gets or sets the move's accuracy.
        /// </summary>
        public int? Accuracy { get; set; }

        /// <summary>
        /// Gets or sets the move's max number of power points.
        /// </summary>
        public int? PP { get; set; }

        /// <summary>
        /// Gets or sets the move's priority.
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// Gets or sets the move's target.
        /// </summary>
        public MoveTarget Target { get; set; }
    }
}
