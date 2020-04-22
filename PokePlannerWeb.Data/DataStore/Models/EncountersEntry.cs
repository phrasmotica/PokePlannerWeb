using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon's encounters in the data store.
    /// </summary>
    public class EncountersEntry : EntryBase
    {
        /// <summary>
        /// Gets the ID of the Pokemon.
        /// </summary>
        public int PokemonId => Key;

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
        /// Gets or sets the ID of the location area of the encounter.
        /// </summary>
        public int LocationAreaId { get; set; }

        /// <summary>
        /// Gets or sets the display names of the encounter.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets the encounter chances indexed by version ID.
        /// </summary>
        public List<WithId<int>> Chances { get; set; }

        /// <summary>
        /// Gets or sets the details of the encounter indexed by version ID.
        /// </summary>
        public List<WithId<EncounterMethodDetails[]>> Details { get; set; }
    }

    /// <summary>
    /// Represents details of an encounter method.
    /// </summary>
    public class EncounterMethodDetails
    {
        /// <summary>
        /// Gets or sets the encounter method.
        /// </summary>
        public EncounterMethodEntry Method { get; set; }

        /// <summary>
        /// Gets or sets the encounter details.
        /// </summary>
        public List<Encounter> EncounterDetails { get; set; }
    }
}
