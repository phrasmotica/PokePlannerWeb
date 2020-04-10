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
        /// The version group service.
        /// </summary>
        private readonly VersionGroupService VersionGroupService;

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
            VersionGroupService versionGroupService,
            ILogger<MoveService> logger) : base(dataStoreSource, pokeApi, moveCacheService, logger)
        {
            MoveCategoryService = moveCategoryService;
            MoveDamageClassService = moveDamageClassService;
            MoveTargetService = moveTargetService;
            TypeService = typeService;
            VersionGroupService = versionGroupService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a move entry for the given move.
        /// </summary>
        protected override async Task<MoveEntry> ConvertToEntry(Move move)
        {
            var displayNames = move.Names.Localise();
            var flavourTextEntries = await GetFlavourTextEntries(move);
            var type = await TypeService.Upsert(move.Type);
            var category = await MoveCategoryService.Upsert(move.Meta.Category);
            var damageClass = await MoveDamageClassService.Upsert(move.DamageClass);
            var target = await MoveTargetService.Upsert(move.Target);

            return new MoveEntry
            {
                Key = move.Id,
                Name = move.Name,
                DisplayNames = displayNames.ToList(),
                FlavourTextEntries = flavourTextEntries.ToList(),
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

        #region Helper methods

        /// <summary>
        /// Returns flavour text entries for the given move, indexed by version group ID.
        /// </summary>
        private async Task<IEnumerable<WithId<LocalString[]>>> GetFlavourTextEntries(Move move)
        {
            var descriptionsList = new List<WithId<LocalString[]>>();

            if (move.FlavorTextEntries.Any())
            {
                foreach (var vg in await VersionGroupService.GetAll())
                {
                    var relevantDescriptions = move.FlavorTextEntries.Where(f => f.VersionGroup.Name == vg.Name);
                    if (relevantDescriptions.Any())
                    {
                        var descriptions = relevantDescriptions.Select(d => new LocalString
                        {
                            Language = d.Language.Name,
                            Value = d.FlavorText
                        });

                        descriptionsList.Add(new WithId<LocalString[]>(vg.VersionGroupId, descriptions.ToArray()));
                    }
                }
            }

            return descriptionsList;
        }

        #endregion
    }
}
