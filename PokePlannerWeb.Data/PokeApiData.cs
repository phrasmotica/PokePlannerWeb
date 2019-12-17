using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokeApiNet;
using PokeApiNet.Models;

namespace PokePlannerWeb.Data
{
    public class PokeApiData
    {
        /// <summary>
        /// Gets or sets the singleton instance.
        /// </summary>
        public static PokeApiData Instance { get; } = new PokeApiData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private PokeApiData() { }

        /// <summary>
        /// Loads the latest version group and generation data.
        /// </summary>
        public async Task LoadVersionGroups()
        {
            Console.WriteLine("PokeApiData: getting version group data...");
            VersionGroups = (await GetMany<VersionGroup>()).ToArray();
            VersionGroup = VersionGroups.Last();
            Generation = await Get(VersionGroup.Generation);
            Console.WriteLine("PokeApiData: got version group data.");
        }

        /// <summary>
        /// Client for PokeApi.
        /// </summary>
        public PokeApiClient Client { get; } = new PokeApiClient();

        /// <summary>
        /// The selected version group.
        /// </summary>
        public VersionGroup VersionGroup { get; set; }

        /// <summary>
        /// The version groups.
        /// </summary>
        public VersionGroup[] VersionGroups { get; set; }

        /// <summary>
        /// The selected version group's generation.
        /// </summary>
        public Generation Generation { get; set; }

        /// <summary>
        /// The selected version group's HM moves.
        /// </summary>
        public IList<Move> HMMoves { get; set; }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(int)"/> with exception logging.
        /// </summary>
        public async Task<T> Get<T>(int id) where T : ResourceBase
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
        public async Task<T> Get<T>(string name) where T : NamedApiResource
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
        public async Task<T> Get<T>(UrlNavigation<T> nav) where T : ResourceBase
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
        public async Task<IEnumerable<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase
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
        /// Wrapper for <see cref="PokeApiClient.GetNamedResourcePageAsync{T}()"/> with exception logging.
        /// </summary>
        public async Task<NamedApiResourceList<T>> GetPage<T>() where T : NamedApiResource
        {
            return await GetPage<T>(20, 0);
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetNamedResourcePageAsync{T}()"/> with exception logging.
        /// </summary>
        public async Task<NamedApiResourceList<T>> GetPage<T>(int limit, int offset) where T : NamedApiResource
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
        public async Task<IEnumerable<T>> GetMany<T>(int limit = 20, int offset = 0) where T : NamedApiResource
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
        public async Task<T> GetLast<T>() where T : NamedApiResource
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
    }
}
