using System;
using PokeApiNet;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Model for a timestamped cache entry.
    /// </summary>
    public class CacheEntry<T> where T : NamedApiResource
    {
        /// <summary>
        /// Gets or sets the creation time.
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// Gets or sets the resource.
        /// </summary>
        public T Resource { get; set; }
    }
}
