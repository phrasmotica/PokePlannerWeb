using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the generation entries in the database.
    /// </summary>
    public class GenerationsService : NamedApiResourceServiceBase<Generation, GenerationEntry>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public GenerationsService(
            ICacheSource<GenerationEntry> cacheSource,
            IPokeAPI pokeApi,
            ILogger<GenerationsService> logger) : base(cacheSource, pokeApi, logger)
        {
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a Type entry for the given Type.
        /// </summary>
        protected override Task<GenerationEntry> ConvertToEntry(Generation generation)
        {
            var displayNames = generation.Names.ToDisplayNames();

            return Task.FromResult(new GenerationEntry
            {
                Key = generation.Id,
                Name = generation.Name,
                DisplayNames = displayNames.ToList()
            });
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all generations.
        /// </summary>
        public async Task<GenerationEntry[]> GetAll()
        {
            var allGenerations = await UpsertAll();
            return allGenerations.ToArray();
        }

        /// <summary>
        /// Returns the generation of the given version group.
        /// </summary>
        public async Task<GenerationEntry> GetByVersionGroup(VersionGroup versionGroup)
        {
            return await Upsert(versionGroup.Generation);
        }

        #endregion
    }
}
