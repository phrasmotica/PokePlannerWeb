using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Cache.Services;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;
using Pokemon = PokeApiNet.Pokemon;
using PokemonEntry = PokePlannerWeb.Data.DataStore.Models.PokemonEntry;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Pokemon entries in the data store.
    /// </summary>
    public class PokemonService : NamedApiResourceServiceBase<Pokemon, PokemonEntry>
    {
        /// <summary>
        /// The move service.
        /// </summary>
        private readonly MoveService MoveService;

        /// <summary>
        /// The Pokemon forms service.
        /// </summary>
        private readonly PokemonFormService PokemonFormsService;

        /// <summary>
        /// The types service.
        /// </summary>
        private readonly TypeService TypesService;

        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupService VersionGroupService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonService(
            IDataStoreSource<PokemonEntry> dataStoreSource,
            IPokeAPI pokeApi,
            PokemonCacheService pokemonCacheService,
            MoveService moveService,
            PokemonFormService pokemonFormsService,
            TypeService typesService,
            VersionGroupService versionGroupsService,
            ILogger<PokemonService> logger) : base(dataStoreSource, pokeApi, pokemonCacheService, logger)
        {
            MoveService = moveService;
            PokemonFormsService = pokemonFormsService;
            TypesService = typesService;
            VersionGroupService = versionGroupsService;
        }

        #region Entry conversion methods

        /// <summary>
        /// Returns a Pokemon entry for the given Pokemon.
        /// </summary>
        protected override async Task<PokemonEntry> ConvertToEntry(Pokemon pokemon)
        {
            var forms = await GetForms(pokemon);
            var types = await GetTypes(pokemon);
            var baseStats = await GetBaseStats(pokemon);
            var moves = await GetMoves(pokemon);

            return new PokemonEntry
            {
                Key = pokemon.Id,
                Name = pokemon.Name,
                SpriteUrl = GetSpriteUrl(pokemon),
                ShinySpriteUrl = GetShinySpriteUrl(pokemon),
                Forms = forms.ToList(),
                Types = types,
                BaseStats = baseStats,
                Moves = moves.ToList()
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns the Pokemon with the given ID from the data store.
        /// </summary>
        public async Task<PokemonEntry> GetPokemon(int pokemonId)
        {
            return await Upsert(pokemonId);
        }

        /// <summary>
        /// Returns the Pokemon forms of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<PokemonFormEntry[]> GetPokemonForms(int pokemonId, int versionGroupId)
        {
            var entry = await Upsert(pokemonId);
            var formEntries = await PokemonFormsService.UpsertMany(entry.Forms.Select(f => f.Id));
            return formEntries.OrderBy(f => f.FormId).ToArray();
        }

        /// <summary>
        /// Returns the moves of the Pokemon with the given ID in the version group with the
        /// given ID from the data store.
        /// </summary>
        public async Task<MoveEntry[]> GetPokemonMoves(int pokemonId, int versionGroupId)
        {
            var entry = await Upsert(pokemonId);
            var relevantMoves = entry.Moves.Single(m => m.Id == versionGroupId);
            var moveEntries = await MoveService.UpsertMany(relevantMoves.Data.Select(m => m.Id));
            return moveEntries.OrderBy(m => m.MoveId).ToArray();
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetSpriteUrl(Pokemon pokemon)
        {
            var frontDefaultUrl = pokemon.Sprites.FrontDefault;
            if (frontDefaultUrl == null)
            {
                Logger.LogWarning($"Pokemon {pokemon.Id} is missing front default sprite");
            }

            return frontDefaultUrl;
        }

        /// <summary>
        /// Returns the URL of the shiny sprite of this Pokemon.
        /// </summary>
        private string GetShinySpriteUrl(Pokemon pokemon)
        {
            var frontShinyUrl = pokemon.Sprites.FrontShiny;
            if (frontShinyUrl == null)
            {
                Logger.LogWarning($"Pokemon {pokemon.Id} is missing front default shiny sprite");
            }

            return frontShinyUrl;
        }

        /// <summary>
        /// Returns the Pokemon that this Pokemon species represents.
        /// </summary>
        private async Task<IEnumerable<PokemonForm>> GetForms(Pokemon pokemon)
        {
            var formsList = new List<PokemonForm>();

            foreach (var form in pokemon.Forms)
            {
                var source = await PokemonFormsService.Upsert(form);
                formsList.Add(new PokemonForm
                {
                    Id = source.FormId,
                    Name = source.Name
                });
            }

            return formsList;
        }

        /// <summary>
        /// Returns the types of the given Pokemon in all version groups.
        /// </summary>
        private async Task<List<WithId<Type[]>>> GetTypes(Pokemon pokemon)
        {
            var typesList = new List<WithId<Type[]>>();

            var newestIdWithoutData = await VersionGroupService.GetOldestVersionGroupId();

            if (pokemon.PastTypes.Any())
            {
                foreach (var vg in await VersionGroupService.GetAll())
                {
                    var types = pokemon.PastTypes.FirstOrDefault(t => t.Generation.Name == vg.Generation.Name);
                    if (types != null)
                    {
                        var typeEntries = await MinimiseTypes(types.Types);
                        for (var id = newestIdWithoutData; id <= vg.VersionGroupId; id++)
                        {
                            typesList.Add(new WithId<Type[]>(id, typeEntries.ToArray()));
                        }

                        newestIdWithoutData = vg.VersionGroupId + 1;
                    }
                }
            }

            // always include the newest types
            var newestId = await VersionGroupService.GetNewestVersionGroupId();
            var newestTypeEntries = await MinimiseTypes(pokemon.Types);
            for (var id = newestIdWithoutData; id <= newestId; id++)
            {
                typesList.Add(new WithId<Type[]>(id, newestTypeEntries.ToArray()));
            }

            return typesList;
        }

        /// <summary>
        /// Minimises a set of Pokemon types.
        /// </summary>
        private async Task<IEnumerable<Type>> MinimiseTypes(IEnumerable<PokemonType> types)
        {
            var newestTypeObjs = await TypesService.UpsertMany(types.Select(t => t.Type));
            return newestTypeObjs.Select(t => new Type
            {
                Id = t.TypeId,
                Name = t.Name
            });
        }

        /// <summary>
        /// Returns the base stats of the given Pokemon.
        /// </summary>
        private async Task<List<WithId<int[]>>> GetBaseStats(Pokemon pokemon)
        {
            // FUTURE: anticipating a generation-based base stats changelog
            // in which case this method will need to look like GetTypes()
            var newestId = await VersionGroupService.GetNewestVersionGroupId();
            var currentBaseStats = pokemon.GetBaseStats(newestId);

            var versionGroups = await VersionGroupService.GetAll();
            var statsList = versionGroups.Select(
                vg => new WithId<int[]>(vg.VersionGroupId, currentBaseStats)
            );

            return statsList.ToList();
        }

        /// <summary>
        /// Returns the moves of the given Pokemon.
        /// </summary>
        private async Task<IEnumerable<WithId<Move[]>>> GetMoves(Pokemon pokemon)
        {
            var movesList = new List<WithId<Move[]>>();

            var versionGroups = await VersionGroupService.GetAll();
            foreach (var vg in versionGroups)
            {
                var moves = await GetMoves(pokemon, vg);
                var movesEntry = new WithId<Move[]>(vg.VersionGroupId, moves.ToArray());
                movesList.Add(movesEntry);
            }

            return movesList;
        }

        /// <summary>
        /// Returns the given Pokemon's moves in the version group with the given ID.
        /// </summary>
        private async Task<IEnumerable<Move>> GetMoves(Pokemon pokemon, VersionGroupEntry versionGroup)
        {
            var allMoves = pokemon.Moves;
            var relevantMoves = allMoves.Where(m =>
            {
                var versionGroupNames = m.VersionGroupDetails.Select(vgd => vgd.VersionGroup.Name);
                return versionGroupNames.Contains(versionGroup.Name);
            });

            var moveEntries = await MoveService.UpsertMany(relevantMoves.Select(m => m.Move));
            return moveEntries.Select(m => new Move
            {
                Id = m.MoveId,
                Name = m.Name
            });
        }

        #endregion
    }
}
