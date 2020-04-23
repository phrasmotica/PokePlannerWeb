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

    /// <summary>
    /// Model for an encounter detail.
    /// </summary>
    public class EncounterDetailEntry
    {
        /// <summary>
        /// The lowest level of the encounter detail.
        /// </summary>
        public int MinLevel { get; set; }

        /// <summary>
        /// The highest level of the encounter detail.
        /// </summary>
        public int MaxLevel { get; set; }

        /// <summary>
        /// The condition values that must be in effect for this encounter to occur.
        /// </summary>
        public List<EncounterConditionValueEntry> ConditionValues { get; set; }

        /// <summary>
        /// The percent chance that this encounter will occur.
        /// </summary>
        public int Chance { get; set; }
    }
}
