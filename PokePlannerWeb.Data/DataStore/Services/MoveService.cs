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
        /// The move damage class service.
        /// </summary>
        private readonly MoveDamageClassService MoveDamageClassService;

        /// <summary>
        /// The type service.
        /// </summary>
        private readonly TypeService TypeService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public MoveService(
            IDataStoreSource<MoveEntry> dataStoreSource,
            IPokeAPI pokeApi,
            MoveCacheService moveCacheService,
            MoveDamageClassService moveDamageClassService,
            TypeService typeService,
            ILogger<MoveService> logger) : base(dataStoreSource, pokeApi, moveCacheService, logger)
        {
            MoveDamageClassService = moveDamageClassService;
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
            var damageClass = await MoveDamageClassService.Upsert(move.DamageClass);

            return new MoveEntry
            {
                Key = move.Id,
                Name = move.Name,
                DisplayNames = displayNames.ToList(),
                Type = new Type
                {
                    Id = type.TypeId,
                    Name = type.Name
                },
                Power = move.Power,
                DamageClass = new MoveDamageClass
                {
                    Id = damageClass.MoveDamageClassId,
                    Name = damageClass.Name
                },
                Accuracy = move.Accuracy,
                PP = move.Pp,
                Priority = move.Priority
                }
            };
        }

        #endregion
    }
}
