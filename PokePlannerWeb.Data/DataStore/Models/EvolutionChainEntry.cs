namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a evolution chain in the data store.
    /// </summary>
    public class EvolutionChainEntry : EntryBase
    {
        /// <summary>
        /// Gets the ID of the evolution chain.
        /// </summary>
        public int EvolutionChainId => Key;

        // TODO: make this useful
    }
}
