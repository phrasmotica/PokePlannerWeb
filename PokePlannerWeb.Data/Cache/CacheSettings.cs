﻿namespace PokePlannerWeb.Data.Cache
{
    /// <summary>
    /// Class for PokePlannerWeb cache settings.
    /// </summary>
    public class CacheSettings : ICacheSettings
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
        /// The name of the collection of generations.
        /// </summary>
        public string GenerationCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of locations.
        /// </summary>
        public string LocationCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of location areas.
        /// </summary>
        public string LocationAreaCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of pokedexes.
        /// </summary>
        public string PokedexCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        public string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        public string PokemonFormCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon species.
        /// </summary>
        public string PokemonSpeciesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of stats.
        /// </summary>
        public string StatCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        public string TypeCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of versions.
        /// </summary>
        public string VersionCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of version groups.
        /// </summary>
        public string VersionGroupCollectionName { get; set; }
    }

    /// <summary>
    /// Interface for PokePlannerWeb cache settings.
    /// </summary>
    public interface ICacheSettings
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
        /// The name of the collection of generations.
        /// </summary>
        string GenerationCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of locations.
        /// </summary>
        string LocationCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of location areas.
        /// </summary>
        string LocationAreaCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of pokedexes.
        /// </summary>
        string PokedexCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        string PokemonFormCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon species.
        /// </summary>
        string PokemonSpeciesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of stats.
        /// </summary>
        string StatCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        string TypeCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of versions.
        /// </summary>
        string VersionCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of version groups.
        /// </summary>
        string VersionGroupCollectionName { get; set; }
    }
}
