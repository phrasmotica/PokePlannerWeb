using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Services;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the evolution chain entries in the data store.
    /// </summary>
    public class EvolutionChainService : ServiceBase<EvolutionChain, EvolutionChainEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public EvolutionChainService(
            IDataStoreSource<EvolutionChainEntry> dataStoreSource,
            IPokeAPI pokeApi,
            EvolutionChainCacheService cacheService,
            ILogger<EvolutionChainService> logger) : base(dataStoreSource, pokeApi, cacheService, logger)
        {
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a generation entry for the given generation.
        /// </summary>
        protected override Task<EvolutionChainEntry> ConvertToEntry(EvolutionChain evolutionChain)
        {
            return Task.FromResult(new EvolutionChainEntry
            {
                Key = evolutionChain.Id
            });
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

        #endregion
    }
}
