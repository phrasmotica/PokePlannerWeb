using PokeApiNet.Models;
using PokePlannerWeb.Data.Extensions;
using System.Linq;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data.Payloads
{
    /// <summary>
    /// Class minimally representing a Pokemon API resource.
    /// </summary>
    public class PokemonPayload : ResourcePayload<Pokemon>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public PokemonPayload(Pokemon pokemon) : base(pokemon) { }

        /// <summary>
        /// Creates a PokemonPayload and returns it.
        /// </summary>
        public static async Task<PokemonPayload> Create(Pokemon pokemon)
        {
            var payload = new PokemonPayload(pokemon);
            await payload.FetchAsync();
            return payload;
        }

        /// <summary>
        /// The base Pokemon object.
        /// </summary>
        public Pokemon Pokemon => Resource;

        /// <summary>
        /// Gets the Pokemon's order in the National Dex.
        /// </summary>
        public int Order => Pokemon.Order;

        /// <summary>
        /// Gets a description of the Pokemon's types.
        /// </summary>
        public string TypeDescription => string.Join(" / ", Pokemon.GetCurrentTypes().Select(t => t.ToString()));

        /// <summary>
        /// Gets the URL of the Pokemon's sprite.
        /// </summary>
        public string SpriteUrl => Pokemon.Sprites.FrontDefault;

        /// <summary>
        /// Assigns any properties that require an asynchronous operation.
        /// </summary>
        public override async Task FetchAsync()
        {
            EnglishName = await Pokemon.GetEnglishName();
        }
    }
}
