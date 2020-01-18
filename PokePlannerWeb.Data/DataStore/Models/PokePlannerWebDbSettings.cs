﻿namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Class for PokePlannerWeb database settings.
    /// </summary>
    public class PokePlannerWebDbSettings : IPokePlannerWebDbSettings
    {
        /// <summary>
        /// The database connection string.
        /// </summary>
        public string ConnectionString { get; set; }

        /// <summary>
        /// The name of the database.
        /// </summary>
        public string DatabaseName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        public string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        public string PokemonFormsCollectionName { get; set; }
    }

    /// <summary>
    /// Interface for PokePlannerWeb database settings.
    /// </summary>
    public interface IPokePlannerWebDbSettings
    {
        /// <summary>
        /// The database connection string.
        /// </summary>
        string ConnectionString { get; set; }

        /// <summary>
        /// The name of the database.
        /// </summary>
        string DatabaseName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        string PokemonFormsCollectionName { get; set; }
    }
}
