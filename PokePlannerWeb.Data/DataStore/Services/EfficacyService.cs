using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Types;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for accessing efficacy information.
    /// </summary>
    public class EfficacyService
    {
        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected IPokeAPI PokeApi;

        /// <summary>
        /// The Pokemon service.
        /// </summary>
        private readonly PokemonService PokemonService;

        /// <summary>
        /// The type data singleton.
        /// </summary>
        private readonly TypeData TypeData;

        /// <summary>
        /// The logger.
        /// </summary>
        protected readonly ILogger<EfficacyService> Logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        public EfficacyService(
            IPokeAPI pokeApi,
            PokemonService pokemonService,
            TypeData typeData,
            ILogger<EfficacyService> logger)
        {
            PokeApi = pokeApi;
            PokemonService = pokemonService;
            TypeData = typeData;
            Logger = logger;
        }

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given ID in the version group with the
        /// given ID.
        /// </summary>
        public async Task<double[]> GetTypeEfficacy(int pokemonId, int versionGroupId)
        {
            var pokemon = await PokeApi.Get<Pokemon>(pokemonId);
            return await GetTypeEfficacy(pokemon, versionGroupId);
        }

        /// <summary>
        /// Returns the efficacy of the Pokemon with the given name in the version group with the
        /// given ID.
        /// </summary>
        public async Task<double[]> GetTypeEfficacy(string pokemonName, int versionGroupId)
        {
            var pokemon = await PokeApi.Get<Pokemon>(pokemonName);
            return await GetTypeEfficacy(pokemon, versionGroupId);
        }

        #region Helpers

        /// <summary>
        /// Returns the given Pokemon's type efficacy in the version group with the given ID as an array.
        /// </summary>
        private async Task<double[]> GetTypeEfficacy(Pokemon pokemon, int versionGroupId)
        {
            var types = await PokemonService.GetPokemonTypesInVersionGroup(pokemon.Id, versionGroupId);
            return TypeData.GetEfficacyArr(types.Select(t => t.ToEnum<Types.Type>()));
        }

        #endregion
    }
}
