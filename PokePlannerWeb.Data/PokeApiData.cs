using PokeApiNet;
using PokeApiNet.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data
{
    public class PokeApiData
    {
        /// <summary>
        /// Singleton constructor;
        /// </summary>
        private PokeApiData() { }

        /// <summary>
        /// Singleton instance.
        /// </summary>
        public static PokeApiData Instance { get; set; } = new PokeApiData();

        /// <summary>
        /// Client for PokeApi.
        /// </summary>
        public PokeApiClient Client { get; } = new PokeApiClient();

        /// <summary>
        /// The selected version group.
        /// </summary>
        public VersionGroup VersionGroup { get; set; }

        /// <summary>
        /// The selected version group's generation.
        /// </summary>
        public Generation Generation { get; set; }

        /// <summary>
        /// The selected version group's HM moves.
        /// </summary>
        public IList<Move> HMMoves { get; set; }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(int)"/> with exception handling.
        /// Returns null if an exception was thrown.
        /// </summary>
        public async Task<T> Get<T>(int id) where T : ResourceBase
        {
            T res;
            try
            {
                Console.WriteLine($@"Get<{typeof(T)}>({id}) started...");
                res = await Client.GetResourceAsync<T>(id);
                Console.WriteLine($@"Get<{typeof(T)}>({id}) finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($@"Get() failed to retrieve {typeof(T)} resource by id.");
                return null;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(string)"/> with exception handling.
        /// Returns null if an exception was thrown.
        /// </summary>
        public async Task<T> Get<T>(string name) where T : NamedApiResource
        {
            T res;
            try
            {
                Console.WriteLine($@"Get<{typeof(T)}>({name}) started...");
                res = await Client.GetResourceAsync<T>(name);
                Console.WriteLine($@"Get<{typeof(T)}>({name}) finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($@"Get() failed to retrieve {typeof(T)} resource by name.");
                return null;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(UrlNavigation{T})"/> with exception handling.
        /// Returns null if an exception was thrown.
        /// </summary>
        public async Task<T> Get<T>(UrlNavigation<T> nav) where T : ResourceBase
        {
            T res;
            try
            {
                Console.WriteLine($@"Get<{typeof(T)}>({nav.Url}) started...");
                res = await Client.GetResourceAsync(nav);
                Console.WriteLine($@"Get<{typeof(T)}>({nav.Url}) finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($@"Get() failed to retrieve {typeof(T)} resource from UrlNavigation object.");
                return null;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(IEnumerable{UrlNavigation{T}})"/> with exception handling.
        /// Returns null if an exception was thrown.
        /// </summary>
        public async Task<IList<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase
        {
            List<T> resList;
            try
            {
                Console.WriteLine($@"Get<{typeof(T)}>(urlList) started...");
                resList = await Client.GetResourceAsync(nav);
                Console.WriteLine($@"Get<{typeof(T)}>(urlList) finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($@"Get() failed to retrieve {typeof(T)} resources from UrlNavigation objects.");
                return null;
            }

            return resList;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetNamedResourcePageAsync{T}()"/> with exception handling.
        /// Returns null if an exception was thrown.
        /// </summary>
        public async Task<NamedApiResourceList<T>> GetPage<T>() where T : NamedApiResource
        {
            NamedApiResourceList<T> resList;
            try
            {
                Console.WriteLine($@"GetPage<{typeof(T)}>() started...");
                resList = await Client.GetNamedResourcePageAsync<T>();
                Console.WriteLine($@"GetPage<{typeof(T)}>() finished.");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Console.WriteLine($@"Get() failed to retrieve page of {typeof(T)} resources.");
                return null;
            }

            return resList;
        }
    }
}
