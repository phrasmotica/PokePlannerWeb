using System;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Class for managing cached display strings.
    /// </summary>
    public abstract class DisplayStringsCacheManager
    {
        /// <summary>
        /// The JSON cache file for the display strings.
        /// </summary>
        protected abstract string FilePath { get; }

        /// <summary>
        /// The lifespan of the cached data.
        /// </summary>
        protected abstract TimeSpan Lifespan { get; }

        /// <summary>
        /// Gets the time of this cache's last update.
        /// </summary>
        protected DateTime LastUpdate => ReadCache().Timestamp;

        /// <summary>
        /// Gets whether this cache needs an update.
        /// </summary>
        protected bool NeedsUpdate => DateTime.UtcNow - LastUpdate > Lifespan;

        /// <summary>
        /// Updates the cache (if necessary) with data from PokeAPI.
        /// </summary>
        public async Task UpdateCache()
        {
            var path = Path.GetFullPath(FilePath);
            if (NeedsUpdate)
            {
                var newCache = await FetchData();
                WriteCache(newCache);
                Console.WriteLine($"Updated {newCache.Strings.Count} display strings in {path}.");
            }
            else
            {
                Console.WriteLine($"No update needed in {path}.");
            }
        }

        /// <summary>
        /// Fetches new data for the cache from PokeAPI.
        /// </summary>
        protected abstract Task<DisplayStringsCache> FetchData();

        /// <summary>
        /// Deserialises the cache file into an object.
        /// </summary>
        public DisplayStringsCache ReadCache()
        {
            // TODO: copy cache file to %APPDATA% at runtime so they can be accessed via an
            // absolute path
            if (!File.Exists(FilePath))
            {
                return new DisplayStringsCache
                {
                    Timestamp = default,
                    Strings = null
                };
            }

            var contents = File.ReadAllText(FilePath);
            return JsonConvert.DeserializeObject<DisplayStringsCache>(contents);
        }

        /// <summary>
        /// Overwrites the cache file with the given data.
        /// </summary>
        protected void WriteCache(DisplayStringsCache newCache)
        {
            var contents = JsonConvert.SerializeObject(newCache, Formatting.Indented);
            File.WriteAllText(FilePath, contents);
        }
    }
}
