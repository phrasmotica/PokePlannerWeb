using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the version group entries in the database.
    /// </summary>
    public class VersionGroupsService : NamedApiResourceServiceBase<VersionGroup, VersionGroupEntry>
    {
        /// <summary>
        /// The generations service.
        /// </summary>
        private readonly GenerationsService GenerationsService;

        /// <summary>
        /// The pokedexes service.
        /// </summary>
        private readonly PokedexesService PokedexesService;

        /// <summary>
        /// The versions service.
        /// </summary>
        private readonly VersionsService VersionsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public VersionGroupsService(
            ICacheSource<VersionGroupEntry> cacheSource,
            IPokeAPI pokeApi,
            GenerationsService generationsService,
            PokedexesService pokedexesService,
            VersionsService versionsService,
            ILogger<VersionGroupsService> logger) : base(cacheSource, pokeApi, logger)
        {
            GenerationsService = generationsService;
            PokedexesService = pokedexesService;
            VersionsService = versionsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a version group entry for the given Pokemon.
        /// </summary>
        protected override async Task<VersionGroupEntry> ConvertToEntry(VersionGroup versionGroup)
        {
            var displayNames = await GetDisplayNames(versionGroup);
            var generation = await GenerationsService.GetByVersionGroup(versionGroup);
            var versions = await VersionsService.UpsertMany(versionGroup.Versions);
            var pokedexes = await PokedexesService.UpsertMany(versionGroup.Pokedexes);

            return new VersionGroupEntry
            {
                Key = versionGroup.Id,
                Name = versionGroup.Name,
                Order = versionGroup.Order,
                DisplayNames = displayNames.ToList(),
                Generation = new Generation
                {
                    Id = generation.GenerationId,
                    Name = generation.Name
                },
                Versions = versions.Select(v => new Version
                {
                    Id = v.VersionId,
                    Name = v.Name
                }).ToList(),
                Pokedexes = pokedexes.Select(p => new Pokedex
                {
                    Id = p.PokedexId,
                    Name = p.Name
                }).ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the index of the oldest version group.
        /// </summary>
        public async Task<int> GetOldestVersionGroupId()
        {
            var entries = await GetAllEntries();
            return entries.Select(vg => vg.VersionGroupId).Min();
        }

        /// <summary>
        /// Returns the index of the newest version group.
        /// </summary>
        public async Task<int> GetNewestVersionGroupId()
        {
            var entries = await GetAllEntries();
            return entries.Select(vg => vg.VersionGroupId).Max();
        }

        /// <summary>
        /// Returns all version groups.
        /// </summary>
        public async Task<VersionGroupEntry[]> GetAll()
        {
            var allVersionGroups = await UpsertAll();
            return allVersionGroups.OrderBy(vg => vg.Order).ToArray();
        }

        /// <summary>
        /// Returns the version groups spanned by the set of version IDs.
        /// </summary>
        public async Task<VersionGroupEntry[]> UpsertManyByVersionIds(IEnumerable<int> versionIds)
        {
            var allVersionGroups = await UpsertAll();
            var relevantVersionGroups = allVersionGroups.Where(vg =>
            {
                var myVersionIds = vg.Versions.Select(v => v.Id);
                return myVersionIds.Intersect(versionIds).Any();
            });

            return relevantVersionGroups.ToArray();
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the display names of the given version group in all locales.
        /// </summary>
        private async Task<IEnumerable<DisplayName>> GetDisplayNames(VersionGroup versionGroup)
        {
            var versions = await VersionsService.UpsertMany(versionGroup.Versions);
            var versionsNames = versions.Select(v => v.DisplayNames.OrderBy(n => n.Language).ToList());
            var namesList = versionsNames.Aggregate(
                (nv1, nv2) => nv1.Zip(
                    nv2, (n1, n2) => new DisplayName
                    {
                        Language = n1.Language,
                        Name = n1.Name + "/" + n2.Name
                    }
                ).ToList()
            );

            return namesList;
        }

        #endregion
    }
}
