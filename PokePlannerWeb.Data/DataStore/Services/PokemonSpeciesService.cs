﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using PokemonSpeciesEntry = PokePlannerWeb.Data.DataStore.Models.PokemonSpeciesEntry;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon species entries in the database.
    /// </summary>
    public class PokemonSpeciesService : ServiceBase<PokemonSpecies, int, PokemonSpeciesEntry>
    {
        /// <summary>
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonSpeciesService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            PokemonService pokemonService,
            ILogger<PokemonSpeciesService> logger) : base(settings, pokeApi, logger)
        {
            PokemonService = pokemonService;
        }

        /// <summary>
        /// Creates a connection to the Pokemon collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<PokemonSpeciesEntry>(settings.PokemonSpeciesCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the database.
        /// </summary>
        protected override PokemonSpeciesEntry Get(int speciesId)
        {
            return Collection.Find(p => p.SpeciesId == speciesId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Pokemon in the database and returns it.
        /// </summary>
        protected override PokemonSpeciesEntry Create(PokemonSpeciesEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Pokemon with the given ID from the database.
        /// </summary>
        protected override void Remove(int speciesId)
        {
            Collection.DeleteOne(p => p.SpeciesId == speciesId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Pokemon species with the given ID.
        /// </summary>
        protected override async Task<PokemonSpecies> FetchSource(int speciesId)
        {
            Logger.LogInformation($"Fetching Pokemon species source object with ID {speciesId}...");
            return await PokeApi.Get<PokemonSpecies>(speciesId);
        }

        /// <summary>
        /// Returns a Pokemon species entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonSpeciesEntry> ConvertToEntry(PokemonSpecies species)
        {
            var varieties = await GetVarieties(species);

            return new PokemonSpeciesEntry
            {
                SpeciesId = species.Id,
                DisplayNames = GetDisplayNames(species).ToList(),
                Varieties = varieties.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all Pokemon species.
        /// </summary>
        public async Task<PokemonSpeciesEntry[]> GetPokemonSpecies()
        {
            var allSpecies = await UpsertAll();
            return allSpecies.ToArray();
        }

        /// <summary>
        /// Returns the varieties of the Pokemon species with the given ID in the version group with
        /// the given ID.
        /// </summary>
        public async Task<Models.PokemonEntry[]> GetPokemonSpeciesVarieties(int speciesId, int versionGroupId)
        {
            var entry = await GetOrCreate(speciesId);
            var varietyEntries = await PokemonService.GetOrCreateMany(entry.Varieties.Select(v => v.Id));
            return varietyEntries.ToArray();
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns this Pokemon species's display names.
        /// </summary>
        private IEnumerable<DisplayName> GetDisplayNames(PokemonSpecies species)
        {
            return species.Names.ToDisplayNames().ToList();
        }

        /// <summary>
        /// Returns the Pokemon that this Pokemon species represents.
        /// </summary>
        private async Task<IEnumerable<Pokemon>> GetVarieties(PokemonSpecies species)
        {
            var varietiesList = new List<Pokemon>();

            foreach (var res in species.Varieties)
            {
                var sourceEntry = await PokemonService.Upsert(res.Pokemon);
                varietiesList.Add(new Pokemon
                {
                    Id = sourceEntry.PokemonId,
                    Name = sourceEntry.Name
                });
            }

            return varietiesList;
        }

        #endregion
    }
}