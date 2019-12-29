using System;
using System.Collections.Generic;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Interface for a timestamped cache of display names.
    /// </summary>
    public class DisplayStringsCache
    {
        /// <summary>
        /// The time at which the cache was created.
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// The display strings.
        /// </summary>
        public Dictionary<string, string> Strings { get; set; }

        /// <summary>
        /// Constructor.
        /// </summary>
        public DisplayStringsCache()
        {
            Strings = new Dictionary<string, string>();
        }

        /// <summary>
        /// Returns the value for the given key.
        /// </summary>
        public string Get(string key)
        {
            return Strings[key];
        }

        /// <summary>
        /// Adds a display string to the cache.
        /// </summary>
        public void Add(string key, string value)
        {
            Strings[key] = value;
        }
    }
}
