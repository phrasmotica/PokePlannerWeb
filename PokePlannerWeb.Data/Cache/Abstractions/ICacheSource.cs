﻿using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PokeApiNet;

namespace PokePlannerWeb.Data.Cache.Abstractions
{
    /// <summary>
    /// Interface for data sources that cache named PokeAPI resources.
    /// </summary>
    public interface ICacheSource<TResource> where TResource : NamedApiResource
    {
        /// <summary>
        /// Returns all resources.
        /// </summary>
        Task<IEnumerable<TResource>> GetAll();

        /// <summary>
        /// Returns the first resource that matches the given predicate.
        /// </summary>
        Task<TResource> GetOne(Expression<Func<TResource, bool>> predicate);

        /// <summary>
        /// Creates the given resource and returns it.
        /// </summary>
        Task<TResource> Create(TResource resource);

        /// <summary>
        /// Deletes the first resource that matches the given predicate.
        /// </summary>
        Task DeleteOne(Expression<Func<TResource, bool>> predicate);
    }
}
