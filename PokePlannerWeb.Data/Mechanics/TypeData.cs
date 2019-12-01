using PokePlannerWeb.Data.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokePlannerWeb.Data.Mechanics
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
        /// <summary>
        /// Internal storage for type efficacy.
        /// Keys are defensive types, values are offensive types
        /// mapped to their effectivenesses against the key.
        /// </summary>
        private IDictionary<Type, Dictionary<Type, double>> Efficacy;

        /// <summary>
        /// Private constructor.
        /// </summary>
        private TypeData() { }

        /// <summary>
        /// Singleton instance.
        /// </summary>
        public static TypeData Instance { get; } = new TypeData();

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
        /// Reads Type data into the efficacy map.
        /// </summary>
        public async void LoadTypeData()
        {
            Efficacy = new Dictionary<Type, Dictionary<Type, double>>();

            var tasks = ConcreteTypes.Select(async thisType =>
            {
                // retrieve type object from PokeAPI
                var typeName = thisType.ToString().ToLower();
                var typeObj = await PokeApiData.Instance.Get<PokeApiNet.Models.Type>(typeName);

                Console.WriteLine($@"Setting {typeName} efficacy data...");
                Efficacy[thisType] = new Dictionary<Type, double>();
                Efficacy[thisType].Initialise(ConcreteTypes, 1);

                // populate damage relations
                // wen can do this with the 'from' relations alone
                var damageRelations = await typeObj.GetDamageRelations();

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
            });
            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// Returns the efficacy dictionary for the given defensive type.
        /// </summary>
        public IDictionary<Type, double> GetEfficacy(Type defType)
        {
            return Efficacy[defType];
        }

        /// <summary>
        /// Returns the effectiveness multiplier for the
        /// given offensive type against the defensive type.
        /// </summary>
        public double GetEfficacy(Type offType, Type defType)
        {
            return GetEfficacy(defType)[offType];
        }

        /// <summary>
        /// Returns the effectiveness multiplier for the
        /// given offensive type against the defensive types.
        /// </summary>
        public double GetEfficacy(Type offType, Type defType1, Type defType2)
        {
            return GetEfficacy(offType, defType1) * GetEfficacy(offType, defType2);
        }
    }
}
