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
            await VersionGroupData.Instance.LoadVersionGroups();

            // verify it's all loaded
            Assert.AreEqual(18, VersionGroupData.Instance.VersionGroups.Length);
        }

        /// <summary>
        /// Verifies that stat loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task StatsLoadingTest()
        {
            // load stats
            await StatData.Instance.LoadStats();

            // verify it's all loaded
            Assert.AreEqual(8, StatData.Instance.Stats.Length);
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
