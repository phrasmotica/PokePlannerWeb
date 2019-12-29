using System;
using System.Threading.Tasks;
using PokeApiNet.Models;

namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Class for managing cached display names for secondary Pokemon forms.
    /// </summary>
    public class PokemonFormDisplayNamesCacheManager : DisplayStringsCacheManager
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static PokemonFormDisplayNamesCacheManager Instance { get; } = new PokemonFormDisplayNamesCacheManager();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private PokemonFormDisplayNamesCacheManager() { }

        #endregion

        /// <summary>
        /// The JSON cache file for the Pokemon form display names.
        /// </summary>
        protected override string FilePath => "Cache\\PokemonFormDisplayNames.json";

        /// <summary>
        /// The lifespan of the Pokemon form display names.
        /// </summary>
        protected override TimeSpan Lifespan => TimeSpan.FromDays(365);

        /// <summary>
        /// Fetches new Pokemon form display names from PokeAPI.
        /// </summary>
        protected override async Task<DisplayStringsCache> FetchData()
        {
            var newCache = new DisplayStringsCache();

            var secondaryFormsPage = await PokeAPI.GetPage<PokemonForm>(316, 807);

            try
            {
                foreach (var pokemonFormResource in secondaryFormsPage.Results)
                {
                    var key = pokemonFormResource.Name;
                    var pokemonForm = await PokeAPI.Get(pokemonFormResource);
                    var value = pokemonForm.GetEnglishName();

                    newCache.Add(key, value);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error fetching data: {e.Message}");
            }

            newCache.Timestamp = DateTime.UtcNow;
            return newCache;
        }
    }
}
