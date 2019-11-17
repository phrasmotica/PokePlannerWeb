using System;

namespace PokePlannerWeb.Data.Extensions
{
    /// <summary>
    /// Extension methods that are non-specific.
    /// </summary>
    public static class Extensions
    {
        /// <summary>
        /// Returns the string as an enum value.
        /// </summary>
        public static T ToEnum<T>(this string st)
        {
            if (string.IsNullOrEmpty(st))
            {
                return default;
            }

            return (T) Enum.Parse(typeof(T), st, true);
        }
    }
}
