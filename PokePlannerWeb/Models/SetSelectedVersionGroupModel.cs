namespace PokePlannerWeb.Models
{
    /// <summary>
    /// Model for the body sent in requests to set the version group.
    /// </summary>
    public class SetSelectedVersionGroupModel
    {
        /// <summary>
        /// The index of the version group to set.
        /// </summary>
        public int Index { get; set; }
    }
}
