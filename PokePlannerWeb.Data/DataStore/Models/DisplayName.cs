namespace PokePlannerWeb.Data.DataStore
{
    /// <summary>
    /// Represents a display name for a given language.
    /// </summary>
    public class LocalString
    {
        /// <summary>
        /// The language of the display name.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// The display name.
        /// </summary>
        public string Name { get; set; }
    }
}
