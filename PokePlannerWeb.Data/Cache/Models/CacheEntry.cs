﻿using System;
using Newtonsoft.Json;
using PokeApiNet;

namespace PokePlannerWeb.Data.Cache.Models
{
    /// <summary>
    /// Model for a timestamped cache entry.
    /// </summary>
    public class CacheEntry<T> where T : NamedApiResource
    {
        /// <summary>
        /// Gets or sets the ID.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; set; }

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
