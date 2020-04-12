using System;
using System.Collections.Generic;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents an item in the data store.
    /// </summary>
    public class ItemEntry : NamedApiResourceEntry
    {
        /// <summary>
        /// Gets the ID of the item.
        /// </summary>
        public int ItemId => Key;

        /// <summary>
        /// Gets or sets the display names of the item.
        /// </summary>
        public List<LocalString> DisplayNames { get; set; }

        /// <summary>
        /// Returns a subset of this entry for use in <see cref="EvolutionChainEntry"/>.
        /// </summary>
        public ItemEntry ForEvolutionChain()
        {
            return new ItemEntry
            {
                Key = Key,
                Name = Name,
                DisplayNames = DisplayNames
            };
        }
    }
}
