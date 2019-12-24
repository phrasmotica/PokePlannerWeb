using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet;
using PokeApiNet.Models;

namespace PokePlannerWeb.Data
{
    /// <summary>
    /// Class for fetching PokeAPI resources through static functions.
    /// </summary>
    public class PokeAPI
    {
        #region Singleton members

        /// <summary>
        /// Gets or sets the singleton instance.
        /// </summary>
        public static PokeAPI Instance { get; } = new PokeAPI();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private PokeAPI() { }

        #endregion

        #region PokeAPI client

        /// <summary>
        /// Client for PokeAPI.
        /// </summary>
        private static PokeApiClient Client { get; } = new PokeApiClient();

        #endregion

        #region Resource Get() methods

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(int)"/> with exception logging.
        /// </summary>
        public static async Task<T> Get<T>(int id) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>({id})";
            T res;
            try
            {
                Console.WriteLine($"{call} started...");
                res = await Client.GetResourceAsync<T>(id);
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(string)"/> with exception logging.
        /// </summary>
        public static async Task<T> Get<T>(string name) where T : NamedApiResource
        {
            var call = $"Get<{typeof(T)}>(\"{name}\")";
            T res;
            try
            {
                Console.WriteLine($"{call} started...");
                res = await Client.GetResourceAsync<T>(name);
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(UrlNavigation{T})"/> with exception logging.
        /// </summary>
        public static async Task<T> Get<T>(UrlNavigation<T> nav) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>(\"{nav.Url}\")";
            T res;
            try
            {
                Console.WriteLine($"{call} started...");
                res = await Client.GetResourceAsync(nav);
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} from UrlNavigation object failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(IEnumerable{UrlNavigation{T}})"/> with exception logging.
        /// </summary>
        public static async Task<IEnumerable<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>(urlList)";
            List<T> resList;
            try
            {
                Console.WriteLine($"{call} started...");
                resList = await Client.GetResourceAsync(nav);
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} from UrlNavigation objects failed.");
                throw;
            }

            return resList;
        }

        /// <summary>
        /// Returns a page with all Pokemon.
        /// </summary>
        public static async Task<NamedApiResourceList<T>> GetFullPage<T>() where T : NamedApiResource
        {
            var call = $"GetFullPage<{typeof(T)}>()";
            NamedApiResourceList<T> res;
            try
            {
                Console.WriteLine($"{call} started...");

                var page = await GetPage<T>(1, 1);
                res = await GetPage<T>(page.Count, 0);

                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetNamedResourcePageAsync{T}()"/> with exception logging.
        /// </summary>
        public static async Task<NamedApiResourceList<T>> GetPage<T>() where T : NamedApiResource
        {
            return await GetPage<T>(20, 0);
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetNamedResourcePageAsync{T}()"/> with exception logging.
        /// </summary>
        public static async Task<NamedApiResourceList<T>> GetPage<T>(int limit, int offset) where T : NamedApiResource
        {
            var call = $"GetPage<{typeof(T)}>(limit={limit}, offset={offset})";
            NamedApiResourceList<T> resList;
            try
            {
                Console.WriteLine($"{call} started...");
                resList = await Client.GetNamedResourcePageAsync<T>(limit, offset);
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return resList;
        }

        /// <summary>
        /// Returns many named API resources of the given type.
        /// </summary>
        public static async Task<IEnumerable<T>> GetMany<T>(int limit = 20, int offset = 0) where T : NamedApiResource
        {
            var call = $"GetMany<{typeof(T)}>(limit={limit}, offset={offset})";
            IEnumerable<T> res;
            try
            {
                Console.WriteLine($"{call} started...");

                var page = await GetPage<T>(limit, offset);
                res = await Get(page.Results);

                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Returns the last named API resource of the given type.
        /// </summary>
        public static async Task<T> GetLast<T>() where T : NamedApiResource
        {
            var call = $"GetLast<{typeof(T)}>()";
            T res;
            try
            {
                Console.WriteLine($"{call} started...");

                // get a page to find the resource count
                var page = await GetPage<T>();
                if (!string.IsNullOrEmpty(page.Next))
                {
                    // get the last page if that wasn't it
                    page = await GetPage<T>(page.Count - 1, 1);
                }

                res = await Get(page.Results.Last());
                Console.WriteLine($"{call} finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($"{call} failed.");
                throw;
            }

            return res;
        }

        #endregion
    }
}
