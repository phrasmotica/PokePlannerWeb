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
    /// Service for managing the move entries in the data store.
    /// </summary>
    public class MoveService : NamedApiResourceServiceBase<Move, MoveEntry>
    {
        /// <summary>
        /// The type cache service.
        /// </summary>
        private readonly TypeService TypeService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveService(
            IDataStoreSource<MoveEntry> dataStoreSource,
            IPokeAPI pokeApi,
            MoveCacheService moveCacheService,
            TypeService typeService,
            ILogger<MoveService> logger) : base(dataStoreSource, pokeApi, moveCacheService, logger)
        {
            TypeService = typeService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a move entry for the given move.
        /// </summary>
        protected override async Task<MoveEntry> ConvertToEntry(Move move)
        {
            var displayNames = move.Names.ToDisplayNames();
            var type = await TypeService.Upsert(move.Type);

            return new MoveEntry
            {
                Key = move.Id,
                Name = move.Name,
                DisplayNames = displayNames.ToList(),
                Type = new Type
                {
                    Id = type.TypeId,
                    Name = type.Name
                }
            };
        }

        #endregion
    }
}
