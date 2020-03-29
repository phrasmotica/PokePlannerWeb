using System.Collections.Generic;
using System.Linq;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon form in the data store.
    /// </summary>
    public class PokemonFormEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon form.
        /// </summary>
        public int FormId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the Pokemon form.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the form name of the Pokemon form.
        /// </summary>
        public string FormName { get; set; }

        /// <summary>
        /// Gets or sets whether the form is a mega evolution.
        /// </summary>
        public bool IsMega { get; set; }

        /// <summary>
        /// Gets or sets the version group in which this form was introduced.
        /// </summary>
        public VersionGroup VersionGroup { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon form's display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon form's front default sprite URL.
        /// </summary>
        public string SpriteUrl { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon form's front shiny sprite URL.
        /// </summary>
        public string ShinySpriteUrl { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon form's types indexed by version group ID.
        /// </summary>
        public List<WithId<Type[]>> Types { get; set; }
    }
}
