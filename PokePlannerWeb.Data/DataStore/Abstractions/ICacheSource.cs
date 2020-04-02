using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Abstractions
{
    /// <summary>
    /// Interface for data sources used for caching PokeAPI resources.
    /// </summary>
    public interface ICacheSource<TEntry> where TEntry : EntryBase
    {
        /// <summary>
        /// Returns all entries in the cache.
        /// </summary>
        Task<IEnumerable<TEntry>> GetAll();

        /// <summary>
        /// Returns the first entry that matches the given predicate.
        /// </summary>
        Task<TEntry> GetOne(Expression<Func<TEntry, bool>> predicate);

        /// <summary>
        /// Creates the given entry and returns it.
        /// </summary>
        Task<TEntry> Create(TEntry entry);

        /// <summary>
        /// Deletes the first entry that matches the given predicate.
        /// </summary>
        Task DeleteOne(Expression<Func<TEntry, bool>> predicate);
    }
}
