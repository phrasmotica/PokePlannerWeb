using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NUnit.Framework;
using PokeApiNet;
using PokePlannerWeb.Cache;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Types;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Tests for the <see cref="PokeAPI"/> singleton.
    /// </summary>
    public class PokeAPITests
    {
        /// <summary>
        /// Verifies that version group loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task VersionGroupsLoadingTest()
        {
            // load version groups
            await VersionGroupData.Instance.LoadData();

            // verify it's all loaded
            Assert.AreEqual(18, VersionGroupData.Instance.DataCount);
        }

        /// <summary>
        /// Verifies that stat loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task StatsLoadingTest()
        {
            // load stats
            await StatData.Instance.LoadData();

            // verify it's all loaded
            Assert.AreEqual(8, StatData.Instance.DataCount);
        }

        /// <summary>
        /// Verifies that loading the names of all Pokemon works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task PokemonNamesLoadingTest()
        {
            // load all Pokemon names
            var speciesPage = await PokeAPI.GetFullPage<PokemonSpecies>();

            // verify they're all there
            Assert.AreEqual(807, speciesPage.Count);

            // returns true if the name is a single block of alphanumerics
            static bool isSimpleName(string name) => Regex.IsMatch(name, "^[a-z0-9]+$");

            var remainingCount = 0;
            foreach (var species in speciesPage.Results)
            {
                if (!isSimpleName(species.Name))
                {
                    remainingCount++;
                    Console.WriteLine(species.Name);
                }
            }

            Console.WriteLine(remainingCount);
        }

        /// <summary>
        /// Verifies that the Pokemon species cache works correctly.
        /// </summary>
        [Test]
        [Category("Unit")]
        public void PokemonSpeciesCacheTest()
        {
            var cache = PokemonSpeciesCacheManager.Instance.ReadCache();
            Assert.AreEqual(807, cache.Count);

            var entry = cache.Get(3);
            Assert.AreEqual(entry.DisplayNames.Single(dn => dn.Language == "en").Name, "Venusaur");

            var variety = entry.Varieties.Last();
            Assert.AreEqual(variety.DisplayNames.Single(dn => dn.Language == "en").Name, "Mega Venusaur");
        }

        /// <summary>
        /// Investigated the differences between Pokemon forms and Pokemon varieties.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task PokemonFormsVarietiesDifferencesTest()
        {
            // list of Pokemon IDs
            var ids = new[] { 3, 6, 9, 386, 479, 493, 649 };

            foreach (var id in ids)
            {
                // check forms
                var pokemon = await PokeAPI.Get<Pokemon>(id);
                Console.WriteLine($"{pokemon.Name} has {pokemon.Forms.Count} forms");

                var pokemonName = pokemon.Name;
                var pokemonStats = pokemon.Stats.Select(s => s.BaseStat).ToArray();
                var forms = (await PokeAPI.Get(pokemon.Forms)).ToList();

                var formsDifferentStats = new List<bool>();
                foreach (var form in forms)
                {
                    // check Pokemon linked from form
                    var formName = form.Name;
                    var formPokemonName = form.Pokemon.Name;
                    Console.WriteLine($"{formName} links back to Pokemon {formPokemonName}");

                    if (pokemonName != formPokemonName)
                    {
                        // check form has different stats to the primary form
                        var formPokemon = await PokeAPI.Get(form.Pokemon);
                        formsDifferentStats.Add(!CompareBaseStats(formPokemon, pokemon));
                    }
                    else
                    {
                        Console.WriteLine($"{formPokemonName} share base stats with {pokemonName}");
                    }
                }

                if (forms.Count > 1)
                {
                    if (formsDifferentStats.All(b => b))
                    {
                        Console.WriteLine($"All secondary forms of {pokemonName} share base stats with the primary form");
                    }
                    else
                    {
                        Console.WriteLine($"Some secondary forms of {pokemonName} have different base stats to the primary form");
                    }
                }
                else
                {
                    Console.WriteLine($"{pokemonName} only has one form");
                }

                Console.WriteLine(Environment.NewLine);

                // check varieties
                var species = await PokeAPI.Get(pokemon.Species);
                var varieties = species.Varieties;
                Console.WriteLine($"{species.Name} has {varieties.Count} varieties");

                var varietiesDifferentStats = new List<bool>();
                for (var i = 0; i < varieties.Count; i++)
                {
                    // check Pokemon linked from variety
                    var variety = varieties[i];
                    var varietyName = variety.Pokemon.Name;
                    Console.WriteLine($"Variety {i} links back to Pokemon {varietyName}");

                    if (pokemonName != varietyName)
                    {
                        // check variety has different stats to the default variety
                        var varietyPokemon = await PokeAPI.Get(variety.Pokemon);
                        varietiesDifferentStats.Add(CompareBaseStats(varietyPokemon, pokemon));
                    }
                }

                if (varieties.Count > 1)
                {
                    if (varietiesDifferentStats.All(b => b))
                    {
                        Console.WriteLine($"All secondary varieties of {pokemonName} have different base stats to the default variety");
                    }
                    else
                    {
                        Console.WriteLine($"Some secondary varieties of {pokemonName} share base stats with the default variety");
                    }
                }
                else
                {
                    Console.WriteLine($"{pokemonName} only has one variety");
                }

                Console.WriteLine(Environment.NewLine);
                Console.WriteLine(Environment.NewLine);
                Console.WriteLine(Environment.NewLine);
            }
        }

        /// <summary>
        /// Returns true if the two Pokemon have different sets of base stats.
        /// </summary>
        private bool CompareBaseStats(Pokemon p1, Pokemon p2)
        {
            // check variety has different stats to the primary variety
            var p1Name = p1.Name;
            var p1Stats = p1.Stats.Select(s => s.BaseStat).ToArray();

            var p2Name = p2.Name;
            var p2Stats = p2.Stats.Select(s => s.BaseStat).ToArray();

            Console.WriteLine($"{p1Name} has stats [{string.Join(", ", p1Stats)}]");
            Console.WriteLine($"{p2Name} has stats [{string.Join(", ", p2Stats)}]");

            if (ArraysAreEqual(p1Stats, p2Stats))
            {
                Console.WriteLine($"{p1Name} and {p2Name} have THE SAME base stats");
                return false;
            }

            Console.WriteLine($"{p1Name} and {p2Name} have DIFFERENT base stats");
            return true;
        }

        /// <summary>
        /// Returns true if all corresponding elements in the arrays are equal.
        /// </summary>
        private bool ArraysAreEqual<T>(T[] arr1, T[] arr2)
        {
            return arr1.Zip(arr2).All(p => p.First.Equals(p.Second));
        }

        /// <summary>
        /// Investigates the names of secondary Pokemon forms.
        /// </summary>
        [Test]
        public async Task PokemonFormsNamesTest()
        {
            // get secondary forms
            var forms = await PokeAPI.GetPage<PokemonForm>(316, 807);

            // filter to those with type names in their name
            var typeNames = TypeData.AllTypes.Select(n => n.ToString().ToLower());
            var regex = $"({string.Join("|", typeNames)})$";
            var typeForms = forms.Results.Where(f => Regex.IsMatch(f.Name, regex)).ToList();

            foreach (var form in typeForms)
            {
                Console.WriteLine(form.Name);
            }

            Console.WriteLine($"{typeForms.Count} have their type in their name");
        }

        /// <summary>
        /// Investigates the names of secondary Pokemon forms.
        /// </summary>
        [Test]
        public async Task PokemonLocationAreaEncountersTest()
        {
            // get location area encounters for Abra
            var encounters = await PokeAPI.Instance.GetLocationAreaEncounters(63);
            Assert.IsNotNull(encounters);
        }
    }
}
