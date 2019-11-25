﻿using PokeApiNet;
using PokeApiNet.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data
{
    public class PokeApiData
    {
        /// <summary>
        /// Singleton constructor.
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
        public async Task<IList<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase
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
            var call = $"GetPage<{typeof(T)}>()";
            NamedApiResourceList<T> resList;
            try
            {
                Console.WriteLine($"{call} started...");
                resList = await Client.GetNamedResourcePageAsync<T>();
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
    }
}