using System.Threading.Tasks;
using NUnit.Framework;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Payloads;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Tests for the <see cref="PokeApiData"/> singleton.
    /// </summary>
    public class PokeApiDataTests
    {
        /// <summary>
        /// Verifies that version group loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task VersionGroupsLoadingTest()
        {
            // load version groups
            await PokeApiData.Instance.LoadVersionGroups();

            // verify it's all loaded
            Assert.AreEqual(18, PokeApiData.Instance.VersionGroups.Length);
        }

        /// <summary>
        /// Verifies that a Pokemon payload is created correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task PokemonPayloadCreationTest()
        {
            // get Pokemon resource
            var pokemon = await PokeApiData.Instance.Get<Pokemon>(1);

            // create payload
            var payload = await PokemonPayload.Create(pokemon);

            // verify name is correct
            Assert.AreEqual("Bulbasaur", payload.EnglishName);
        }
    }
}
