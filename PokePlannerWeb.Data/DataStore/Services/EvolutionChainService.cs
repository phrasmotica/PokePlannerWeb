using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Services;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the evolution chain entries in the data store.
    /// </summary>
    public class EvolutionChainService : ServiceBase<EvolutionChain, EvolutionChainEntry>
    {
        /// <summary>
        /// The Pokemon species cache service.
        /// </summary>
        private readonly PokemonSpeciesCacheService PokemonSpeciesCacheService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EvolutionChainService(
            IDataStoreSource<EvolutionChainEntry> dataStoreSource,
            IPokeAPI pokeApi,
            EvolutionChainCacheService cacheService,
            PokemonSpeciesCacheService pokemonSpeciesCacheService,
            ILogger<EvolutionChainService> logger) : base(dataStoreSource, pokeApi, cacheService, logger)
        {
            PokemonSpeciesCacheService = pokemonSpeciesCacheService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a generation entry for the given generation.
        /// </summary>
        protected override async Task<EvolutionChainEntry> ConvertToEntry(EvolutionChain evolutionChain)
        {
            var chain = await CreateChainLinkEntry(evolutionChain.Chain);

            return new EvolutionChainEntry
            {
                Key = evolutionChain.Id,
                Chain = chain
            };
        }

        /// <summary>
        /// Returns the evolution chain required to create an evolution chain entry with the given ID.
        /// </summary>
        protected override async Task<EvolutionChain> FetchSource(int key)
        {
            Logger.LogInformation($"Fetching evolution chain source object with ID {key}...");
            return await CacheService.Upsert(key);
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all evolution chains.
        /// </summary>
        public async Task<EvolutionChainEntry[]> GetAll()
        {
            var allEvolutionChains = await UpsertAll();
            return allEvolutionChains.OrderBy(g => g.Id).ToArray();
        }

        /// <summary>
        /// Upserts the evolution chain from the given navigation property and returns it.
        /// </summary>
        public override async Task<EvolutionChainEntry> Upsert(UrlNavigation<EvolutionChain> evolutionChain)
        {
            var chainRes = await CacheService.Upsert(evolutionChain);
            if (chainRes.IsEmpty())
            {
                // don't bother converting if the chain is empty
                return null;
            }

            return await base.Upsert(chainRes);
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns a chain link entry for the given chain link.
        /// </summary>
        private async Task<ChainLinkEntry> CreateChainLinkEntry(ChainLink chainLink)
        {
            var species = await PokemonSpeciesCacheService.Upsert(chainLink.Species);
            var evolutionDetailEntries = await CreateEvolutionDetailEntries(chainLink.EvolutionDetails);

            return new ChainLinkEntry
            {
                IsBaby = chainLink.IsBaby,
                Species = species.Minimise(),
                EvolutionDetails = evolutionDetailEntries.ToList(),
                EvolvesTo = null // TODO: recursively create chain link entries
            };
        }

        /// <summary>
        /// Returns a list of evolution detail entries for the given list of evolution details.
        /// </summary>
        private async Task<IEnumerable<EvolutionDetailEntry>> CreateEvolutionDetailEntries(IEnumerable<EvolutionDetail> evolutionDetails)
        {
            var entryList = new List<EvolutionDetailEntry>();

            foreach (var detail in evolutionDetails)
            {
                var entry = await CreateEvolutionDetailEntry(detail);
                entryList.Add(entry);
            }

            return entryList;
        }

        /// <summary>
        /// Returns an evolution detail entry for the given evolution detail.
        /// </summary>
        private async Task<EvolutionDetailEntry> CreateEvolutionDetailEntry(EvolutionDetail evolutionDetail)
        {
            // TODO: implement
            return null;
        }

        #endregion
    }
}
