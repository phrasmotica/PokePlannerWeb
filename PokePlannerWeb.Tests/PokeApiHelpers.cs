using System.Collections.Generic;
using PokeApiNet;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Helper functions for generating PokeAPI objects for tests.
    /// </summary>
    public class PokeApiHelpers
    {
        /// <summary>
        /// Returns a navigation property for a named API resource.
        /// </summary>
        public static NamedApiResource<T> NamedResourceNavigation<T>(string name = "name", string url = "url")
            where T : NamedApiResource
        {
            return new NamedApiResource<T>
            {
                Name = name,
                Url = url
            };
        }

        /// <summary>
        /// Returns a list of encounters for a single method.
        /// </summary>
        public static IEnumerable<Encounter> Encounters(int count = 2, NamedApiResource<EncounterMethod> method = null)
        {
            for (int i = 0; i < count; i++)
            {
                yield return new Encounter
                {
                    Chance = i + 1,
                    MinLevel = i + 1,
                    MaxLevel = i + 6,
                    Method = method ?? NamedResourceNavigation<EncounterMethod>()
                };
            }
        }
    }
}
