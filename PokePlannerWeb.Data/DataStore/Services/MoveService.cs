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
        /// The move category service.
        /// </summary>
        private readonly MoveCategoryService MoveCategoryService;

        /// <summary>
        /// The move damage class service.
        /// </summary>
        private readonly MoveDamageClassService MoveDamageClassService;

        /// <summary>
        /// The move target service.
        /// </summary>
        private readonly MoveTargetService MoveTargetService;

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
            MoveCategoryService moveCategoryService,
            MoveDamageClassService moveDamageClassService,
            MoveTargetService moveTargetService,
            TypeService typeService,
            ILogger<MoveService> logger) : base(dataStoreSource, pokeApi, moveCacheService, logger)
        {
            MoveCategoryService = moveCategoryService;
            MoveDamageClassService = moveDamageClassService;
            MoveTargetService = moveTargetService;
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
            var category = await MoveCategoryService.Upsert(move.Meta.Category);
            var damageClass = await MoveDamageClassService.Upsert(move.DamageClass);
            var target = await MoveTargetService.Upsert(move.Target);

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
                Category = new MoveCategory
                {
                    Id = category.MoveCategoryId,
                    Name = category.Name
                },
                Power = move.Power,
                DamageClass = new MoveDamageClass
                {
                    Id = damageClass.MoveDamageClassId,
                    Name = damageClass.Name
                },
                Accuracy = move.Accuracy,
                PP = move.Pp,
                Priority = move.Priority,
                Target = new MoveTarget
                {
                    Id = target.MoveTargetId,
                    Name = target.Name
                }
            };
        }

        #endregion
    }
}
