using System.Collections.Generic;
using System.Linq;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Pokemon mapped to its forms in the data store.
    /// </summary>
    public class PokemonFormsEntry : EntryBase
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon.
        /// </summary>
        public int PokemonId { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon's forms.
        /// </summary>
        public List<PokemonForm> Forms { get; set; }

        /// <summary>
        /// Returns the IDs of this Pokemon's forms.
        /// </summary>
        public IEnumerable<int> GetFormIds()
        {
            return Forms.Select(f => f.FormId);
        }

        /// <summary>
        /// Returns the names of this Pokemon's forms in the given locale.
        /// </summary>
        public IEnumerable<string> GetFormDisplayNames(string locale = "en")
        {
            return Forms.SelectMany(f => f.DisplayNames)
                        .Where(n => n.Language == locale)
                        .Select(n => n.Name);
        }
    }

    /// <summary>
    /// Represents a Pokemon form in the data store.
    /// </summary>
    public class PokemonForm
    {
        /// <summary>
        /// Gets or sets the ID of the Pokemon form.
        /// </summary>
        public int FormId { get; set; }

        /// <summary>
        /// Gets or sets this Pokemon form's display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Returns the name of this Pokemon form in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Name;
        }
    }
}
