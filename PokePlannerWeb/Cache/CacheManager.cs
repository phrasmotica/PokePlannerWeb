using System.IO;
using Newtonsoft.Json;

namespace PokePlannerWeb.Cache
{
    /// <summary>
    /// Class for managing a cache.
    /// </summary>
    public class CacheManager<T> where T : CacheEntry
    {
        /// <summary>
        /// The JSON cache file.
        /// </summary>
        protected virtual string CachePath { get; }

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

        /// <summary>
        /// Returns the entry with the given key.
        /// </summary>
        protected T GetEntry(int key)
        {
            return ReadCache().Get(key);
        }
    }
}
