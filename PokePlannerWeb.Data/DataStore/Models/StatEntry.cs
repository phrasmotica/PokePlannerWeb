using System.Collections.Generic;
using System.Linq;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a stat in the data store.
    /// </summary>
    public class StatEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the stat.
        /// </summary>
        public int StatId => Key;

        /// <summary>
        /// Gets or sets this stat's display names.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets whether this stat is a battle-only stat.
        /// </summary>
        public bool IsBattleOnly { get; set; }

        /// <summary>
        /// Returns the name of this stat entry in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Value;
        }
    }
}
