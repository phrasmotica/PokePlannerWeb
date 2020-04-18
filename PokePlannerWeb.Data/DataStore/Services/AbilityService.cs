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
    /// Service for managing the ability entries in the data store.
    /// </summary>
    public class AbilityService : NamedApiResourceServiceBase<Ability, AbilityEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public AbilityService(
            IDataStoreSource<AbilityEntry> dataStoreSource,
            IPokeAPI pokeApi,
            AbilityCacheService abilityCacheService,
            ILogger<AbilityService> logger) : base(dataStoreSource, pokeApi, abilityCacheService, logger)
        {
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns an ability entry for the given ability.
        /// </summary>
        protected override Task<AbilityEntry> ConvertToEntry(Ability ability)
        {
            var displayNames = ability.Names.Localise();

            return Task.FromResult(new AbilityEntry
            {
                Key = ability.Id,
                Name = ability.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all abilities.
        /// </summary>
        public async Task<AbilityEntry[]> GetAll()
        {
            var allAbilities = await UpsertAll();
            return allAbilities.OrderBy(g => g.Id).ToArray();
        }

        #endregion
    }
}
