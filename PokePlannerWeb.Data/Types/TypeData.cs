using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokePlannerWeb.Data.Extensions;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Util;

namespace PokePlannerWeb.Data.Types
{
    /// <summary>
    /// Enumeration of Pokemon types.
    /// </summary>
    public enum Type
    {
        Unknown,
        Normal, Fighting, Flying, Poison, Ground, Rock, Bug, Ghost, Steel,
        Fire, Water, Grass, Electric, Psychic, Ice, Dragon, Dark, Fairy,
        Shadow
    }

    /// <summary>
    /// For Type-related information and calculations.
    /// </summary>
    public class TypeData
    {
        #region Singleton members

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static TypeData Instance { get; } = new TypeData();

        /// <summary>
        /// Singleton constructor.
        /// </summary>
        private TypeData() { }

        #endregion

        #region Efficacy data

        /// <summary>
        /// Loads type efficacy data for the version group with the given ID, or for the latest
        /// version group if no ID is supplied.
        /// </summary>
        public async Task LoadTypeEfficacy(int? versionGroupId = null)
        {
            Console.WriteLine($"Started loading efficacy data for version group {versionGroupId}...");

            Efficacy = new Dictionary<Type, Dictionary<Type, double>>();

            foreach (var thisType in ConcreteTypes)
            {
                // retrieve type object from PokeAPI
                var typeName = thisType.ToString().ToLower();
                var typeObj = await PokeAPI.Get<PokeApiNet.Type>(typeName);

                Console.WriteLine($@"Setting {typeName} efficacy data...");
                Efficacy[thisType] = ConcreteTypes.ToDictionary(1d);

                // populate damage relations - we can do this with the 'from' relations alone
                var damageRelations = await typeObj.GetDamageRelations(versionGroupId);

                foreach (var typeFrom in damageRelations.DoubleDamageFrom.Select(x => x.Name.ToEnum<Type>()))
                {
                    Efficacy[thisType][typeFrom] = 2;
                }

                foreach (var typeFrom in damageRelations.HalfDamageFrom.Select(x => x.Name.ToEnum<Type>()))
                {
                    Efficacy[thisType][typeFrom] = 0.5;
                }

                foreach (var typeFrom in damageRelations.NoDamageFrom.Select(x => x.Name.ToEnum<Type>()))
                {
                    Efficacy[thisType][typeFrom] = 0;
                }

                Console.WriteLine($@"Set {typeName} efficacy data.");
            }

            Console.WriteLine($"Finished loading efficacy data for version group {versionGroupId}.");
        }

        /// <summary>
        /// Internal storage for type efficacy. Keys are defensive types, values are offensive types
        /// mapped to their effectivenesses against the key.
        /// </summary>
        private IDictionary<Type, Dictionary<Type, double>> Efficacy { get; set; }

        /// <summary>
        /// Gets the number of types whose efficacies are loaded.
        /// </summary>
        public int EfficacyMapCount => Efficacy.Count;

        #endregion

        #region Types and type subsets

        /// <summary>
        /// Returns an array of all types.
        /// </summary>
        public static IEnumerable<Type> AllTypes => Enum.GetValues(typeof(Type)).Cast<Type>();

        /// <summary>
        /// Returns an array of all types a Pokemon can have.
        /// </summary>
        public static IEnumerable<Type> PokemonTypes => AllTypes.Where(t => t != Type.Unknown);

        /// <summary>
        /// Returns an array of all types a Move can have.
        /// </summary>
        public static IEnumerable<Type> MoveTypes => AllTypes.Where(t => t != Type.Shadow);

        /// <summary>
        /// Returns an array of all concrete types.
        /// </summary>
        public static IEnumerable<Type> ConcreteTypes => PokemonTypes.Intersect(MoveTypes);

        /// <summary>
        /// Returns the type set for the version group with the given ID.
        /// </summary>
        public async Task<TypeSet> GetTypeSet(int? versionGroupId = null)
        {
            var types = ConcreteTypes.ToArray();
            var typesArePresent = Enumerable.Repeat(false, types.Length).ToArray();

            using (new CodeTimer("Generate type set"))
            {
                versionGroupId ??= VersionGroupData.Instance.LatestVersionGroupIndex;
                var generation = await VersionGroupData.Instance.GetGeneration(versionGroupId.Value);
                for (var i = 0; i < types.Length; i++)
                {
                    var type = types[i];
                    if (await generation.HasType(type))
                    {
                        typesArePresent[i] = true;
                    }
                }
            }

            return new TypeSet
            {
                VersionGroupId = versionGroupId.Value,
                Types = types.Select(t => t.ToString()).ToArray(),
                TypesArePresent = typesArePresent
            };
        }

        #endregion

        /// <summary>
        /// Returns the efficacy dictionary for the given defensive type.
        /// </summary>
        public double[] GetEfficacyArr(Type defType)
        {
            return GetEfficacyMap(defType).OrderBy(kvp => kvp.Key)
                                          .Select(kvp => kvp.Value)
                                          .ToArray();
        }

        /// <summary>
        /// Returns the efficacy array for the given defensive types.
        /// </summary>
        public double[] GetEfficacyArr(IEnumerable<Type> types)
        {
            var eff = Enumerable.Repeat(1d, ConcreteTypes.Count()).ToArray();

            foreach (var type in types)
            {
                eff = eff.Product(GetEfficacyArr(type));
            }

            return eff;
        }

        /// <summary>
        /// Returns the efficacy dictionary for the given defensive type.
        /// </summary>
        public IDictionary<Type, double> GetEfficacyMap(Type defType)
        {
            return Efficacy[defType];
        }

        /// <summary>
        /// Returns the efficacy dictionary for the given defensive types.
        /// </summary>
        public IDictionary<Type, double> GetEfficacyMap(IEnumerable<Type> types)
        {
            var eff = ConcreteTypes.ToDictionary(1d);

            foreach (var type in types)
            {
                eff = eff.Product(GetEfficacyMap(type));
            }

            return eff;
        }

        /// <summary>
        /// Returns the effectiveness multiplier for the given offensive type against the defensive type.
        /// </summary>
        public double GetEfficacy(Type offType, Type defType)
        {
            return GetEfficacyMap(defType)[offType];
        }

        /// <summary>
        /// Returns the effectiveness multiplier for the given offensive type against the defensive types.
        /// </summary>
        public double GetEfficacy(Type offType, Type defType1, Type defType2)
        {
            return GetEfficacy(offType, defType1) * GetEfficacy(offType, defType2);
        }
    }
}
