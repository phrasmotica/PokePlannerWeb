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
    /// Service that manages a list of localised Pokemon species names in the database.
    /// </summary>
    public class PokemonSpeciesNamesService : NamesService
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonSpeciesNamesService(IPokePlannerWebDbSettings settings, ILogger<NamesService> logger) : base(settings, logger)
        {
        }

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
    }
}
