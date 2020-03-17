﻿using System.Collections.Generic;
using System.Threading.Tasks;
using PokeApiNet;

namespace PokePlannerWeb.Data
{
    /// <summary>
    /// Interface for classes that fetch data from PokeAPI.
    /// </summary>
    public interface IPokeAPI
    {
        /// <summary>
        /// Returns the resource of the given type with the given ID.
        /// </summary>
        Task<T> Get<T>(int id) where T : ResourceBase;

        /// <summary>
        /// Returns the named API resource of the given type with the given name.
        /// </summary>
        Task<T> Get<T>(string name) where T : NamedApiResource;

        /// <summary>
        /// Returns the resource of the given type from the given navigation property.
        /// </summary>
        Task<T> Get<T>(UrlNavigation<T> nav) where T : ResourceBase;

        /// <summary>
        /// Returns the resources of the given type from the given set of navigation properties.
        /// </summary>
        Task<IEnumerable<T>> Get<T>(IEnumerable<UrlNavigation<T>> nav) where T : ResourceBase;

        /// <summary>
        /// Returns the location area encounters for the Pokemon with the given ID.
        /// </summary>
        Task<IEnumerable<LocationAreaEncounter>> GetLocationAreaEncounters(int id);

        /// <summary>
        /// Returns a page with all resources of the given type.
        /// </summary>
        Task<NamedApiResourceList<T>> GetFullPage<T>() where T : NamedApiResource;

        /// <summary>
        /// Returns a page with resources of the given type.
        /// </summary>
        Task<NamedApiResourceList<T>> GetPage<T>() where T : NamedApiResource;

        /// <summary>
        /// Returns a page of the given size and offset with resources of the given type.
        /// </summary>
        Task<NamedApiResourceList<T>> GetPage<T>(int limit = 20, int offset = 0) where T : NamedApiResource;

        /// <summary>
        /// Returns a list of the given size and offset with resources of the given type.
        /// </summary>
        Task<IEnumerable<T>> GetMany<T>(int limit = 20, int offset = 0) where T : NamedApiResource;

        /// <summary>
        /// Returns the last named API resource of the given type.
        /// </summary>
        Task<T> GetLast<T>() where T : NamedApiResource;
    }
}