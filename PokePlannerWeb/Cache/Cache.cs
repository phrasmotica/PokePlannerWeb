using System;
using System.Collections.Generic;
using System.Linq;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for a timestamped cache of display names.
    /// </summary>
    public class Cache<T> where T : CacheEntry
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public Cache()
        {
            Entries = new List<T>();
        }

        /// <summary>
        /// The time at which the cache was created.
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// The cache entries.
        /// </summary>
        public List<T> Entries { get; set; }

        /// <summary>
        /// Gets the number of cache entries.
        /// </summary>
        public int Count => Entries.Count;

        /// <summary>
        /// Returns the cache entry with the given key.
        /// </summary>
        public T Get(int key)
        {
            return Entries.SingleOrDefault(e => e.Key == key);
        }
    }

    /// <summary>
    /// Class representing a Pokemon form cache entry.
    /// </summary>
    public class CacheEntry
    {
        /// <summary>
        /// The key for the cache entry.
        /// </summary>
        public int Key { get; set; }
    }
}
