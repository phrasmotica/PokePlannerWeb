using NUnit.Framework;
using PokeApiNet.Models;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Payloads;
using System.Threading.Tasks;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Tests for the <see cref="PokeApiData"/> singleton.
    /// </summary>
    public class PokeApiDataTests
    {
        /// <summary>
        /// Verifies that a Pokemon payload is created correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task PokemonPayloadCreationTest()
        {
            // get Pokemon resource
            var data = await PokeApiData.GetInstance();
            var pokemon = await data.Get<Pokemon>(1);

            // create payload
            var payload = await PokemonPayload.Create(pokemon);

            // verify name is correct
            Assert.AreEqual("Bulbasaur", payload.EnglishName);
        }
    }
}
