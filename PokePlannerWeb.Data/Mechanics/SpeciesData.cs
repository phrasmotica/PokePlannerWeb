using System.Text.RegularExpressions;
using System.Threading.Tasks;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For Species information and calculations.
    /// </summary>
    public class SpeciesData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static SpeciesData Instance { get; } = new SpeciesData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private SpeciesData() { }

        #endregion

        /// <summary>
        /// Returns the names of all species.
        /// </summary>
        public async Task<string[]> GetAllSpeciesNames()
        {
            var allSpecies = await PokeAPI.GetFullPage<PokemonSpecies>();
            var names = new string[allSpecies.Count];

            // returns true if the name is a single block of alphanumerics
            static bool isSimpleName(string name) => Regex.IsMatch(name, "^[a-z0-9]+$");

            for (var i = 0; i < allSpecies.Results.Count; i++)
            {
                var speciesName = allSpecies.Results[i].Name;
                if (isSimpleName(speciesName))
                {
                    // convert simple names to title case
                    names[i] = speciesName.ToTitle();
                }
                else
                {
                    // 14 species have complex names: nidoran-f, nidoran-m, mr-mime, ho-oh, mime-jr,
                    // porygon-z, type-null, jangmo-o, hakamo-o, kommo-o, tapu-koko, tapu-lele,
                    // tapu-bulu, tapu-fini hopefully fetching their real names isn't too slow!
                    var species = await PokeAPI.Get<PokemonSpecies>(speciesName);
                    names[i] = species.Names.GetName();
                }
            }

            return names;
        }
    }
}
