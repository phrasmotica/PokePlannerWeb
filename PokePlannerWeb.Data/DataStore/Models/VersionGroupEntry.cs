using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a version group in the data store.
    /// </summary>
    public class VersionGroupEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the version group.
        /// </summary>
        public int VersionGroupId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the version group.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the order of the version group.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// Gets or sets the display names of the version group.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or set the generation of the version group.
        /// </summary>
        public Generation Generation { get; set; }

        /// <summary>
        /// Gets or set the versions of the version group.
        /// </summary>
        public List<Version> Versions { get; set; }

        /// <summary>
        /// Gets or set the pokedexes of the version group.
        /// </summary>
        public List<Pokedex> Pokedexes { get; set; }
    }
}
