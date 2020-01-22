using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing a list of localised names in the database.
    /// </summary>
    public class NamesService
    {
        /// <summary>
        /// The collection of localised names entries.
        /// </summary>
        protected IMongoCollection<NamesEntry> Collection;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<NamesService> Logger;

        /// <summary>
        /// Create connection to database and initalise logger.
        /// </summary>
        public NamesService(IPokePlannerWebDbSettings settings, ILogger<NamesService> logger)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<NamesEntry>(settings.NamesCollectionName);
            Logger = logger;
        }

        /// <summary>
        /// Gets the time to live for localised names in the entries.
        /// </summary>
        protected virtual TimeSpan TimeToLive { get; } = TimeSpan.FromDays(365);

        #region CRUD methods

        /// <summary>
        /// Returns the names entry with the given resource key from the database.
        /// </summary>
        protected NamesEntry Get(string resourceKey, string locale = "en")
        {
            return Collection.Find(n => n.ResourceKey == resourceKey && n.Locale == locale).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new names entry in the database and returns it.
        /// </summary>
        protected NamesEntry Create(NamesEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the names entry with the given resource key and creates a new one in the database.
        /// </summary>
        protected void Update(string resourceKey, NamesEntry entry, string locale = "en")
        {
            Remove(resourceKey, locale);
            Create(entry);
        }

        /// <summary>
        /// Removes the names entry with the given resource key from the database.
        /// </summary>
        protected void Remove(string resourceKey, string locale = "en")
        {
            Collection.DeleteOne(n => n.ResourceKey == resourceKey && n.Locale == locale);
        }

        #endregion

        #region Pokemon species

        /// <summary>
        /// Returns the names of all Pokemon species in the given locale.
        /// </summary>
        public async Task<string[]> GetPokemonSpeciesNames(string locale = "en")
        {
            var entry = await GetOrCreatePokemonSpeciesNamesEntry(locale);
            return entry.DisplayNames.ToArray();
        }

        /// <summary>
        /// Returns the Pokemon species names entry from the database, creating the entry if it
        /// doesn't exist.
        /// </summary>
        protected async Task<NamesEntry> GetOrCreatePokemonSpeciesNamesEntry(string locale = "en")
        {
            var resourceKey = GetApiEndpointString<PokemonSpecies>();
            var entry = Get(resourceKey, locale);
            if (entry == null)
            {
                Logger.LogInformation("Creating Pokemon species names entry in database...");

                entry = await CreatePokemonSpeciesNamesEntry(locale);
            }
            else if (entry.CreationTime < DateTime.UtcNow - TimeToLive)
            {
                // update entry if it's exceeded its TTL
                Logger.LogInformation("Version groups names entry exceeded TTL.");
                Logger.LogInformation("Creating Pokemon species names entry in database...");

                entry = await UpdatePokemonSpeciesNamesEntry(locale);
            }

            return entry;
        }

        /// <summary>
        /// Creates a names entry for Pokemon species names in the given locale.
        /// </summary>
        protected async Task<NamesEntry> CreatePokemonSpeciesNamesEntry(string locale = "en")
        {
            var names = await FetchPokemonSpeciesNames(locale);
            var resourceKey = GetApiEndpointString<PokemonSpecies>();
            var entry = new NamesEntry
            {
                ResourceKey = resourceKey,
                Locale = locale,
                DisplayNames = names.ToList()
            };

            return Create(entry);
        }

        /// <summary>
        /// Creates a names entry for Pokemon species names in the given locale.
        /// </summary>
        protected async Task<NamesEntry> UpdatePokemonSpeciesNamesEntry(string locale = "en")
        {
            var names = await FetchPokemonSpeciesNames(locale);
            var resourceKey = GetApiEndpointString<PokemonSpecies>();
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
        /// Fetches the name of each Pokemon species in the given locale and returns them in an array.
        /// </summary>
        protected async Task<string[]> FetchPokemonSpeciesNames(string locale = "en")
        {
            // get species results
            var allSpecies = await PokeAPI.GetFullPage<PokemonSpecies>();

            // get name for each species in turn
            var names = new string[allSpecies.Count];
            for (var i = 0; i < allSpecies.Results.Count; i++)
            {
                var result = allSpecies.Results[i];

                Logger.LogInformation($"Fetching name for Pokemon species {result.Name} in {locale} locale...");
                var species = await PokeAPI.Get(result);

                names[i] = species.Names.GetName(locale);
            }

            return names;
        }

        #endregion

        #region Version groups

        /// <summary>
        /// Returns the names of all version groups in the given locale.
        /// TODO: make this generic to some ILocalizable interface in PokeApiNet
        /// </summary>
        public async Task<string[]> GetVersionGroupNames(string locale = "en")
        {
            var entry = await GetOrCreateVersionGroupNamesEntry(locale);
            return entry.DisplayNames.ToArray();
        }

        /// <summary>
        /// Returns the version groups names entry from the database, creating the entry if it
        /// doesn't exist.
        /// TODO: make this generic to some ILocalizable interface in PokeApiNet
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

                entry = await CreateVersionGroupNamesEntry(locale);
            }

            return entry;
        }

        /// <summary>
        /// Creates a names entry for version group names in the given locale.
        /// TODO: make this generic to some ILocalizable interface in PokeApiNet
        /// </summary>
        protected async Task<NamesEntry> CreateVersionGroupNamesEntry(string locale = "en")
        {
            var names = await FetchVersionGroupNames(locale);
            var entry = new NamesEntry
            {
                ResourceKey = GetApiEndpointString<VersionGroup>(),
                Locale = locale,
                DisplayNames = names.ToList()
            };

            return Create(entry);
        }

        /// <summary>
        /// Fetches the name of each version group in the given locale and returns them in an array.
        /// TODO: make this generic to some ILocalizable interface in PokeApiNet
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

        #endregion

        /// <summary>
        /// Returns the PokeAPI endpoint string for the given resource type.
        /// </summary>
        protected static string GetApiEndpointString<T>() where T : ResourceBase
        {
            var propertyInfo = typeof(T).GetProperty("ApiEndpoint", BindingFlags.Static | BindingFlags.NonPublic);
            return propertyInfo.GetValue(null).ToString();
        }
    }
}
