using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service that manages a list of localised version group names in the database.
    /// </summary>
    public class VersionGroupsNamesService : NamesService
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupsNamesService(IPokePlannerWebDbSettings settings, ILogger<NamesService> logger) : base(settings, logger)
        {
        }

        /// <summary>
        /// Returns the names of all version groups in the given locale.
        /// </summary>
        public async Task<string[]> GetVersionGroupNames(string locale = "en")
        {
            var entry = await GetOrCreateVersionGroupNamesEntry(locale);
            return entry.DisplayNames.ToArray();
        }

        /// <summary>
        /// Returns the version groups names entry from the database, creating the entry if it
        /// doesn't exist.
        /// </summary>
        protected async Task<NamesEntry> GetOrCreateVersionGroupNamesEntry(string locale = "en")
        {
            var resourceKey = GetApiEndpointString<VersionGroup>();
            var entry = Get(resourceKey, locale);
            if (entry == null)
            {
                Logger.LogInformation("Creating version groups names entry in database...");

                entry = await CreateVersionGroupNamesEntry(locale);
            }
            else if (entry.CreationTime < DateTime.UtcNow - TimeToLive)
            {
                // update entry if it's exceeded its TTL
                Logger.LogInformation("Version groups names entry exceeded TTL.");
                Logger.LogInformation("Creating version groups names entry in database...");

                entry = await UpdateVersionGroupNamesEntry(locale);
            }

            return entry;
        }

        /// <summary>
        /// Creates a names entry for version group names in the given locale.
        /// </summary>
        protected async Task<NamesEntry> CreateVersionGroupNamesEntry(string locale = "en")
        {
            var names = await FetchVersionGroupNames(locale);
            var resourceKey = GetApiEndpointString<VersionGroup>();
            var entry = new NamesEntry
            {
                ResourceKey = resourceKey,
                Locale = locale,
                DisplayNames = names.ToList()
            };

            return Create(entry);
        }

        /// <summary>
        /// Creates a names entry for version group names in the given locale.
        /// </summary>
        protected async Task<NamesEntry> UpdateVersionGroupNamesEntry(string locale = "en")
        {
            var names = await FetchVersionGroupNames(locale);
            var resourceKey = GetApiEndpointString<VersionGroup>();
            var entry = new NamesEntry
            {
                ResourceKey = resourceKey,
                Locale = locale,
                DisplayNames = names.ToList()
            };

            Update(resourceKey, entry, locale);

            return Get(resourceKey, locale);
        }

        /// <summary>
        /// Fetches the name of each version group in the given locale and returns them in an array.
        /// </summary>
        protected async Task<string[]> FetchVersionGroupNames(string locale = "en")
        {
            // get version group results
            var allVersionGroups = await PokeAPI.GetFullPage<VersionGroup>();

            // get name for each version group in turn
            var names = new string[allVersionGroups.Count];
            for (var i = 0; i < allVersionGroups.Results.Count; i++)
            {
                var result = allVersionGroups.Results[i];

                Logger.LogInformation($"Fetching name for version group {result.Name} in {locale} locale...");
                var versionGroup = await PokeAPI.Get(result);

                names[i] = await versionGroup.GetName(locale);
            }

            return names;
        }
    }
}
