using System;
using System.Collections.Generic;
using System.Linq;

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
        /// Creates a finite dictionary with initial key-value pairs.
        /// </summary>
        public static Dictionary<TKey, TValue> ToDictionary<TKey, TValue>(this IEnumerable<TKey> keys, TValue initialValue) where TKey : Enum
        {
            return keys.ToDictionary(k => k, _ => initialValue);
        }
    }
}
