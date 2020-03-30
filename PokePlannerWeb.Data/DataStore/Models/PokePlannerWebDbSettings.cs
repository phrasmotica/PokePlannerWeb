namespace PokePlannerWeb.Data.DataStore.Models
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
        /// The name of the collection of encounters.
        /// </summary>
        public string EncountersCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of generations.
        /// </summary>
        public string GenerationsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of locations.
        /// </summary>
        public string LocationsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of location areas.
        /// </summary>
        public string LocationAreasCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of pokedexes.
        /// </summary>
        public string PokedexesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        public string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        public string PokemonFormsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon species.
        /// </summary>
        public string PokemonSpeciesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of stats.
        /// </summary>
        public string StatsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        public string TypesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of versions.
        /// </summary>
        public string VersionsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of version groups.
        /// </summary>
        public string VersionGroupsCollectionName { get; set; }
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
        /// The name of the collection of encounters.
        /// </summary>
        string EncountersCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of generations.
        /// </summary>
        string GenerationsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of locations.
        /// </summary>
        string LocationsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of location areas.
        /// </summary>
        string LocationAreasCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of pokedexes.
        /// </summary>
        string PokedexesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon.
        /// </summary>
        string PokemonCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon forms.
        /// </summary>
        string PokemonFormsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of Pokemon species.
        /// </summary>
        string PokemonSpeciesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of stats.
        /// </summary>
        string StatsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of types.
        /// </summary>
        string TypesCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of versions.
        /// </summary>
        string VersionsCollectionName { get; set; }

        /// <summary>
        /// The name of the collection of version groups.
        /// </summary>
        string VersionGroupsCollectionName { get; set; }
    }
}
