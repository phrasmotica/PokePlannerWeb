using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Clients
{
    /// <summary>
    /// Interface for a client that manages entries in a cache.
    /// </summary>
    /// <typeparam name="TKey">The type used as keys for the entries.</typeparam>
    /// <typeparam name="TEntry">The model for cache entries.</typeparam>
    public interface ICacheClient<TKey, TEntry> where TEntry : EntryBase<TKey>
    {
        /// <summary>
        /// Returns the entry with the given key from the cache.
        /// </summary>
        TEntry Get(TKey key);

        /// <summary>
        /// Creates a new entry in the cache and returns it.
        /// </summary>
        TEntry Create(TEntry entry);

        /// <summary>
        /// Updates the entry with the given key in the cache.
        /// </summary>
        void Update(TKey key, TEntry entry);

        /// <summary>
        /// Removes the entry with the given key from the cache.
        /// </summary>
        void Remove(TKey key);
    }
}
