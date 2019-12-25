using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For Pokemon information and calculations.
    /// </summary>
    public class PokemonData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static PokemonData Instance { get; } = new PokemonData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private PokemonData() { }

        #endregion

        /// <summary>
        /// Returns the names of all Pokemon.
        /// </summary>
        public async Task<string[]> GetAllPokemonNames()
        {
            var allPokemon = await PokeAPI.GetFullPage<PokemonSpecies>();
            return allPokemon.Results.Select(p => p.Name).ToArray();
        }
    }
}
