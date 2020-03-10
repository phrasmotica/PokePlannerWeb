using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PokeApiNet;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// Generic class for information and calculations pertaining to a type of named API resource.
    /// </summary>
    public class ResourceData<T> where T : NamedApiResource
    {
        /// <summary>
        /// The PokeAPI data fetcher.
        /// </summary>
        protected readonly IPokeAPI PokeApi;

        /// <summary>
        /// The logger.
        /// </summary>
        protected ILogger<ResourceData<T>> Logger;

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        protected ResourceData(IPokeAPI pokeApi, ILogger<ResourceData<T>> logger)
        {
            PokeApi = pokeApi;
            Logger = logger;
        }

        /// <summary>
        /// Loads all data.
        /// </summary>
        public virtual async Task LoadData()
        {
            Logger.LogInformation($"{GetType().Name}: getting {typeof(T).Name} data...");

            Data = (await PokeApi.GetMany<T>()).ToArray();

            Logger.LogInformation($"{GetType().Name}: got data for {Data.Length} {typeof(T).Name} items.");
        }

        /// <summary>
        /// Gets or sets the data.
        /// </summary>
        protected T[] Data { get; set; }

        /// <summary>
        /// Gets the number of data items.
        /// </summary>
        public virtual int DataCount => Data.Length;
    }
}
