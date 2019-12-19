namespace PokePlannerWeb.Data.Types
{
    /// <summary>
    /// Class mapping types to whether they're present in a version group.
    /// </summary>
    public class TypeSet
    {
        /// <summary>
        /// Gets or sets the version group ID.
        /// </summary>
        public int VersionGroupId { get; set; }

        /// <summary>
        /// Gets or sets the types.
        /// </summary>
        public string[] Types { get; set; }

        /// <summary>
        /// Gets or sets whether the types are present.
        /// </summary>
        public bool[] TypesArePresent { get; set; }
    }
}
