using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon's encounters in the data store.
    /// </summary>
    public class EncountersEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon.
        /// </summary>
        public int PokemonId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the encounters indexed by version group ID.
        /// </summary>
        public List<WithId<EncounterEntry[]>> Encounters { get; set; }
    }

    /// <summary>
    /// Represents an encounter in the data store.
    /// </summary>
    public class EncounterEntry
    {
        /// <summary>
        /// Gets or sets the display names of the encounter.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the encounter chances indexed by version ID.
        /// </summary>
        public List<WithId<int>> Chances { get; set; }
    }
}
