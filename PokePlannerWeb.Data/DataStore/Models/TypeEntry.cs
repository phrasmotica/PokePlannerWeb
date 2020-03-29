﻿using System.Collections.Generic;
using System.Linq;
using PokeApiNet;

namespace PokePlannerWeb.Data.DataStore.Models
{
    /// <summary>
    /// Represents a Type in the data store.
    /// </summary>
    public class TypeEntry : EntryBase<int>
    {
        /// <summary>
        /// Gets or sets the ID of the Type.
        /// </summary>
        public int TypeId
        {
            get => Key;
            set => Key = value;
        }

        /// <summary>
        /// Gets or sets the name of the Type.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets this Type's display names.
        /// </summary>
        public List<DisplayName> DisplayNames { get; set; }

        /// <summary>
        /// Gets or sets whether this Type is concrete.
        /// </summary>
        public bool IsConcrete { get; set; }

        /// <summary>
        /// Gets or sets the generation in which this Type was introduced.
        /// </summary>
        public Generation Generation { get; set; }

        /// <summary>
        /// Gets or sets this Type's efficacy indexed by version group ID and then type ID.
        /// </summary>
        public EfficacyMap EfficacyMap { get; set; }

        /// <summary>
        /// Returns the name of this Type entry in the given locale.
        /// </summary>
        public string GetDisplayName(string locale = "en")
        {
            return DisplayNames.SingleOrDefault(n => n.Language == locale)?.Name;
        }

        /// <summary>
        /// Returns the efficacy set of this Type entry in the version group with the given ID.
        /// </summary>
        public EfficacySet GetEfficacySet(int versionGroupId)
        {
            return EfficacyMap.GetEfficacySet(versionGroupId);
        }
    }

    /// <summary>
    /// Model for a map of version group IDs to efficacies of other types against a given type.
    /// </summary>
    public class EfficacyMap
    {
        /// <summary>
        /// Gets or sets this Type's efficacy indexed by version group ID and then type ID.
        /// </summary>
        public List<WithId<EfficacySet>> EfficacySets { get; set; }

        /// <summary>
        /// Constructor.
        /// </summary>
        public EfficacyMap()
        {
            EfficacySets = new List<WithId<EfficacySet>>();
        }

        /// <summary>
        /// Returns the efficacy in the version group with the given ID.
        /// </summary>
        public EfficacySet GetEfficacySet(int versionGroupId)
        {
            return EfficacySets.Single(e => e.Id == versionGroupId).Data;
        }

        /// <summary>
        /// Sets the given efficacy in the version group with the given ID.
        /// </summary>
        public void SetEfficacySet(int versionGroupId, EfficacySet efficacy)
        {
            EfficacySets.RemoveAll(m => m.Id == versionGroupId);

            var mapping = new WithId<EfficacySet>(versionGroupId, efficacy);
            EfficacySets.Add(mapping);
        }
    }

    /// <summary>
    /// Model for a map of type IDs to efficacy multipliers.
    /// </summary>
    public class EfficacySet
    {
        /// <summary>
        /// Gets or sets the efficacy multipliers.
        /// </summary>
        public List<WithId<double>> EfficacyMultipliers { get; set; }

        /// <summary>
        /// Constructor.
        /// </summary>
        public EfficacySet()
        {
            EfficacyMultipliers = new List<WithId<double>>();
        }

        /// <summary>
        /// Sets the given efficacy in the version group with the given ID.
        /// </summary>
        public void Add(int typeId, double multiplier)
        {
            EfficacyMultipliers.RemoveAll(m => m.Id == typeId);

            var entry = new WithId<double>(typeId, multiplier);
            EfficacyMultipliers.Add(entry);
        }

        /// <summary>
        /// Returns the product of the this efficacy set with another one.
        /// </summary>
        public EfficacySet Product(EfficacySet other)
        {
            var product = new EfficacySet();

            var allTypeIds = GetIds().Union(other.GetIds());
            foreach (var typeId in allTypeIds)
            {
                var first = GetEfficacy(typeId);
                var second = other.GetEfficacy(typeId);

                if (first.HasValue && second.HasValue)
                {
                    product.Add(typeId, first.Value * second.Value);
                }
                else if (first.HasValue)
                {
                    product.Add(typeId, first.Value);
                }
                else if (second.HasValue)
                {
                    product.Add(typeId, second.Value);
                }
            }

            return product;
        }

        /// <summary>
        /// Returns all type IDs in this efficacy set.
        /// </summary>
        private IEnumerable<int> GetIds()
        {
            return EfficacyMultipliers.Select(m => m.Id);
        }

        /// <summary>
        /// Returns the efficacy of the type with the given ID.
        /// </summary>
        private double? GetEfficacy(int typeId)
        {
            return EfficacyMultipliers.SingleOrDefault(m => m.Id == typeId)?.Data;
        }
    }
}