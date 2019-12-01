using System;
using System.Collections.Generic;

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

        /// <summary>
        /// Initialises a finite dictionary with initial key-value pairs.
        /// </summary>
        public static void Initialise<TKey, TValue>(this IDictionary<TKey, TValue> dict, IEnumerable<TKey> keys, TValue initValue) where TKey : Enum
        {
            foreach (var key in keys)
            {
                dict[key] = initValue;
            }
        }
    }
}
