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
    /// Service for managing the Pokemon species entries in the data store.
    /// </summary>
    public class PokemonSpeciesService : NamedApiResourceServiceBase<PokemonSpecies, PokemonSpeciesEntry>
    {
        /// <summary>
        /// The evolution chain service.
        /// </summary>
        private readonly EvolutionChainService EvolutionChainService;

        /// <summary>
        /// The generation service.
        /// </summary>
        private readonly GenerationService GenerationService;

        /// <summary>
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupService VersionGroupsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonSpeciesService(
            IDataStoreSource<PokemonSpeciesEntry> dataStoreSource,
            IPokeAPI pokeApi,
            PokemonSpeciesCacheService pokemonSpeciesCacheService,
            EvolutionChainService evolutionChainService,
            GenerationService generationService,
            PokemonService pokemonService,
            VersionGroupService versionGroupsService,
            ILogger<PokemonSpeciesService> logger) : base(dataStoreSource, pokeApi, pokemonSpeciesCacheService, logger)
        {
            EvolutionChainService = evolutionChainService;
            GenerationService = generationService;
            PokemonService = pokemonService;
            VersionGroupsService = versionGroupsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a Pokemon species entry for the given Pokemon species.
        /// </summary>
        protected override async Task<PokemonSpeciesEntry> ConvertToEntry(PokemonSpecies species)
        {
            var varieties = await GetVarieties(species);
            var generation = await GetGeneration(species);
            var evolutionChain = await GetEvolutionChain(species);
            var validity = await GetValidity(species);

            return new PokemonSpeciesEntry
            {
                Key = species.Id,
                Name = species.Name,
                DisplayNames = GetDisplayNames(species).ToList(),
                Varieties = varieties.ToList(),
                Generation = new Generation
                {
                    Id = generation.GenerationId,
                    Name = generation.Name
                },
                EvolutionChain = new EvolutionChain
                {
                    Id = evolutionChain.EvolutionChainId
                },
                Validity = validity.ToList()
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
            return allSpecies.OrderBy(s => s.SpeciesId).ToArray();
        }

        /// <summary>
        /// Returns all Pokemon species up to a limit from an offset.
        /// </summary>
        public async Task<PokemonSpeciesEntry[]> GetPokemonSpecies(int limit, int offset)
        {
            var resources = await PokeApi.GetNamedPage<PokemonSpecies>(limit, offset);
            var species = await UpsertMany(resources);
            return species.OrderBy(s => s.SpeciesId).ToArray();
        }

        /// <summary>
        /// Returns the varieties of the Pokemon species with the given ID in the version group with
        /// the given ID.
        /// </summary>
        public async Task<Models.PokemonEntry[]> GetPokemonSpeciesVarieties(int speciesId, int versionGroupId)
        {
            var entry = await Upsert(speciesId);
            var varietyEntries = await PokemonService.UpsertMany(entry.Varieties.Select(v => v.Id));
            return varietyEntries.OrderBy(v => v.PokemonId).ToArray();
        }

        /// <summary>
        /// Returns the forms of each variety of the Pokemon species with the given ID in the
        /// version group with the given ID.
        /// </summary>
        public async Task<IEnumerable<WithId<PokemonFormEntry[]>>> GetPokemonSpeciesForms(int speciesId, int versionGroupId)
        {
            var formsListList = new List<WithId<PokemonFormEntry[]>>();

            var speciesEntry = await Upsert(speciesId);
            var varietyEntries = await PokemonService.UpsertMany(speciesEntry.Varieties);

            foreach (var varietyEntry in varietyEntries)
            {
                var formsList = await PokemonService.GetPokemonForms(varietyEntry.PokemonId, versionGroupId);
                formsListList.Add(new WithId<PokemonFormEntry[]>(varietyEntry.PokemonId, formsList));
            }

            return formsListList;
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns this Pokemon species's display names.
        /// </summary>
        private IEnumerable<LocalString> GetDisplayNames(PokemonSpecies species)
        {
            return species.Names.Localise().ToList();
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

        /// <summary>
        /// Returns the generation in which the given Pokemon species was introduced.
        /// </summary>
        private async Task<GenerationEntry> GetGeneration(PokemonSpecies species)
        {
            return await GenerationService.Upsert(species.Generation);
        }

        /// <summary>
        /// Returns the evolution chain of the given Pokemon species.
        /// </summary>
        private async Task<EvolutionChainEntry> GetEvolutionChain(PokemonSpecies species)
        {
            return await EvolutionChainService.Upsert(species.EvolutionChain);
        }

        /// <summary>
        /// Returns the IDs of the version groups where the given Pokemon species is valid.
        /// </summary>
        private async Task<IEnumerable<int>> GetValidity(PokemonSpecies pokemonSpecies)
        {
            var versionGroups = await VersionGroupsService.GetAll();
            return versionGroups.Where(vg => IsValid(pokemonSpecies, vg))
                                .Select(vg => vg.VersionGroupId);
        }

        /// <summary>
        /// Returns true if the given Pokemon species can be obtained in the given version group.
        /// </summary>
        private bool IsValid(PokemonSpecies pokemonSpecies, VersionGroupEntry versionGroup)
        {
            if (!versionGroup.Pokedexes.Any() || !pokemonSpecies.PokedexNumbers.Any())
            {
                // PokeAPI data is incomplete
                return true;
            }

            var versionGroupPokedexes = versionGroup.Pokedexes.Select(p => p.Name);
            var pokemonPokedexes = pokemonSpecies.PokedexNumbers.Select(pn => pn.Pokedex.Name);
            return versionGroupPokedexes.Intersect(pokemonPokedexes).Any();
        }

        #endregion
    }
}
