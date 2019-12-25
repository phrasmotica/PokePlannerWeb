using System.Threading.Tasks;
using NUnit.Framework;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Payloads;

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
            var allNames = await PokemonData.Instance.GetAllPokemonNames();

            // verify they're all there
            Assert.AreEqual(807, allNames.Length);
        }

        /// <summary>
        /// Verifies that a Pokemon payload is created correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task PokemonPayloadCreationTest()
        {
            // get Pokemon resource
            var pokemon = await PokeAPI.Get<Pokemon>(1);

            // create payload
            var payload = await PokemonPayload.Create(pokemon);

            // verify name is correct
            Assert.AreEqual("Bulbasaur", payload.EnglishName);
        }
    }
}
