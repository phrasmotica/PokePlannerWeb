using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Clients
{
    /// <summary>
    /// Interface for classes that create clients to caches.
    /// </summary>
    public interface ICacheClientFactory
    {
        /// <summary>
        /// Creates a cache client.
        /// </summary>
        ICacheClient<TKey, TEntry> Create<TKey, TEntry>(string collectionName) where TEntry : EntryBase<TKey>;
    }
}
