using System.IO;
using Newtonsoft.Json;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Interface for managing a cache.
    /// </summary>
    public interface ICacheManager<T> where T : CacheEntry
    {
        /// <summary>
        /// The JSON cache file.
        /// </summary>
        string CachePath { get; }

        /// <summary>
        /// Deserialises the cache file into an object.
        /// </summary>
        public Cache<T> ReadCache()
        {
            if (!File.Exists(CachePath))
            {
                return new Cache<T>
                {
                    Timestamp = default,
                    Entries = null
                };
            }

            var contents = File.ReadAllText(CachePath);
            return JsonConvert.DeserializeObject<Cache<T>>(contents);
        }
    }
}
