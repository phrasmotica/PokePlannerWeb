using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Interface for data sources used for caching PokeAPI resources.
    /// </summary>
    public interface ICacheSource<TEntry>
    {
        /// <summary>
        /// Returns all entries in the cache.
        /// </summary>
        IEnumerable<TEntry> GetAll();

        /// <summary>
        /// Returns the first entry that matches the given predicate.
        /// </summary>
        TEntry GetOne(Expression<Func<TEntry, bool>> predicate);

        /// <summary>
        /// Creates the given entry and returns it.
        /// </summary>
        TEntry Create(TEntry entry);

        /// <summary>
        /// Deletes the first entry that matches the given predicate.
        /// </summary>
        void DeleteOne(Expression<Func<TEntry, bool>> predicate);
    }
}
