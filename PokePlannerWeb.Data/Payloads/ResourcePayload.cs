using PokeApiNet.Models;
using System;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data.Payloads
{
    /// <summary>
    /// Class minimally representing a named API resource.
    /// </summary>
    /// <typeparam name="T">The resource type.</typeparam>
    public class ResourcePayload<T> where T : NamedApiResource
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public ResourcePayload(T resource)
        {
            Resource = resource;
            EnglishName = resource.GetEnglishName();
        }

        /// <summary>
        /// The base resource object.
        /// </summary>
        public virtual T Resource { get; set; }

        /// <summary>
        /// Gets the id of the resource.
        /// </summary>
        public int Id => Resource.Id;

        /// <summary>
        /// Gets the name of the resource.
        /// </summary>
        public string Name => Resource.Name;

        /// <summary>
        /// Gets or sets the English name of the resource.
        /// </summary>
        public virtual string EnglishName { get; protected set; }

        /// <summary>
        /// Assigns any properties that require an asynchronous operation.
        /// </summary>
        public virtual async Task FetchAsync()
        {
            await Task.Run(() => Console.WriteLine("This method should never be called!"));
            throw new NotImplementedException();
        }
    }
}
