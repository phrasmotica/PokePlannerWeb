using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Base class for database entries.
    /// </summary>
    public class EntryBase
    {
        /// <summary>
        /// Gets or sets the ID of the entry.
        /// </summary>
        [BsonId]
        public ObjectId Id { get; set; }

        /// <summary>
        /// Gets the time that the entry was created.
        /// </summary>
        public DateTime Timestamp => Id.CreationTime;
    }
}
