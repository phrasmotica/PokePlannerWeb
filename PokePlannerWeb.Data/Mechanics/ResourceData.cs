using System;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet.Models;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// Generic class for information and calculations pertaining to a type of named API resource.
    /// </summary>
    public class ResourceData<T> where T : NamedApiResource
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static ResourceData<T> Instance { get; } = new ResourceData<T>();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        protected ResourceData() { }

        #endregion

        /// <summary>
        /// Loads all data.
        /// </summary>
        public virtual async Task LoadData()
        {
            Console.WriteLine($"{GetType().Name}: getting {typeof(T).Name} data...");
            Data = (await PokeAPI.GetMany<T>()).ToArray();
            Console.WriteLine($"{GetType().Name}: got data for {Data.Length} {typeof(T).Name} items.");
        }

        /// <summary>
        /// Gets or sets the data.
        /// </summary>
        public T[] Data { get; set; }

        /// <summary>
        /// Gets the number of data items.
        /// </summary>
        public virtual int DataCount => Data.Length;
    }
}
