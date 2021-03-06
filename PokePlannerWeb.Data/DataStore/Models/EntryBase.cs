﻿using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Base class for data store entries.
    /// </summary>
    public class EntryBase
    {
        /// <summary>
        /// Gets or sets the ID of the entry.
        /// </summary>
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonProperty("id")]
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the key of the entry.
        /// </summary>
        public int Key { get; set; }

        /// <summary>
        /// Gets the time that the entry was created.
        /// </summary>
        public DateTime CreationTime { get; set; }
    }
}
