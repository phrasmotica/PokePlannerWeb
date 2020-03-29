using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PokeApiNet;
using PokePlannerWeb.Data.Cache;

namespace PokePlannerWeb.Data
{
    /// <summary>
    /// Class for fetching PokeAPI resources.
    /// </summary>
    public class PokeAPI : IPokeAPI
    {
        /// <summary>
        /// The logger.
        /// </summary>
        private readonly ILogger<PokeAPI> Logger;

        /// <summary>
        /// The client for PokeAPI.
        /// </summary>
        private readonly PokeApiClient PokeApiClient;

        /// <summary>
        /// The base URI for PokeAPI.
        /// </summary>
        private readonly Uri BaseUri = new Uri("http://localhost:8000/api/v2/");

        /// <summary>
        /// Constructor.
        /// </summary>
        public PokeAPI(PokeApiClient pokeApiClient, ILogger<PokeAPI> logger)
        {
            PokeApiClient = pokeApiClient;
            Logger = logger;
        }

        #region Caching

        /// <summary>
        /// Manager for in-memory caches.
        /// </summary>
        private readonly CacheManager cache = new CacheManager();

        #endregion

        #region Resource Get() methods

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(int)"/> with exception logging.
        /// </summary>
        public async Task<T> Get<T>(int id) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>({id})";
            T res;
            try
            {
                Logger.LogInformation($"{call} started...");

                res = await PokeApiClient.GetResourceAsync<T>(id);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
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
                Logger.LogInformation($"{call} started...");

                res = await PokeApiClient.GetResourceAsync<T>(name);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see cref="PokeApiClient.GetResourceAsync{T}(UrlNavigation{T})"/> with
        /// exception logging.
        /// </summary>
        public async Task<T> Get<T>(UrlNavigation<T> nav) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>(\"{nav.Url}\")";
            T res;
            try
            {
                Logger.LogInformation($"{call} started...");

                res = await PokeApiClient.GetResourceAsync(nav);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} from UrlNavigation object failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Wrapper for <see
        /// cref="PokeApiClient.GetResourceAsync{T}(IEnumerable{UrlNavigation{T}})"/> with exception logging.
        /// </summary>
        public async Task<IEnumerable<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase
        {
            var call = $"Get<{typeof(T)}>(urlList)";
            List<T> resList;
            try
            {
                Logger.LogInformation($"{call} started...");

                resList = await PokeApiClient.GetResourceAsync(nav);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} from UrlNavigation objects failed.");
                throw;
            }

            return resList;
        }

        /// <summary>
        /// Returns the location area encounters for the Pokemon with the given ID.
        /// </summary>
        public async Task<IEnumerable<LocationAreaEncounter>> GetLocationAreaEncounters(int id)
        {
            var call = $"GetLocationAreaEncounters({id})";
            IEnumerable<LocationAreaEncounter> res;
            try
            {
                Logger.LogInformation($"{call} started...");

                var pokemon = await Get<Pokemon>(id);
                var url = pokemon.LocationAreaEncounters;
                res = cache.Get<IEnumerable<LocationAreaEncounter>>(url);
                if (res == null)
                {
                    res = await GetFromUrl<IEnumerable<LocationAreaEncounter>>(url);
                    cache.Store(url, res);
                }

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Returns a page with all resources of the given type.
        /// </summary>
        public async Task<NamedApiResourceList<T>> GetFullPage<T>() where T : NamedApiResource
        {
            var call = $"GetFullPage<{typeof(T)}>()";
            NamedApiResourceList<T> res;
            try
            {
                Logger.LogInformation($"{call} started...");

                var page = await GetPage<T>(1, 1);
                res = await GetPage<T>(page.Count, 0);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
                throw;
            }

            return res;
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
                Logger.LogInformation($"{call} started...");

                resList = await PokeApiClient.GetNamedResourcePageAsync<T>(limit, offset);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
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
                Logger.LogInformation($"{call} started...");

                var page = await GetPage<T>(limit, offset);
                res = await Get(page.Results);

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
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
                Logger.LogInformation($"{call} started...");

                // get a page to find the resource count
                var page = await GetPage<T>();
                if (!string.IsNullOrEmpty(page.Next))
                {
                    // get the last page if that wasn't it
                    page = await GetPage<T>(page.Count - 1, 1);
                }

                res = await Get(page.Results.Last());

                Logger.LogInformation($"{call} finished.");
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"{call} failed.");
                throw;
            }

            return res;
        }

        /// <summary>
        /// Returns objects of the given type from a PokeAPI URL.
        /// </summary>
        private async Task<T> GetFromUrl<T>(string url)
        {
            // lowercase as the API doesn't recognise uppercase and lowercase as the same
            var sanitisedUrl = url.ToLowerInvariant();
            if (!sanitisedUrl.EndsWith("/"))
            {
                // trailing slash is needed
                sanitisedUrl += "/";
            }

            using var client = CreateHttpClient();

            var response = await client.GetAsync(sanitisedUrl);
            response.EnsureSuccessStatusCode();

            var resp = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(resp);
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns a HttpClient for sending requests directly to PokeAPI.
        /// </summary>
        private HttpClient CreateHttpClient()
        {
            return new HttpClient
            {
                BaseAddress = BaseUri
            };
        }

        #endregion
    }
}
