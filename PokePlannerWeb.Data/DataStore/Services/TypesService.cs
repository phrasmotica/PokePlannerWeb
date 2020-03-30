using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using PokeApiNet;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.DataStore.Services
{
    /// <summary>
    /// Service for managing the Type entries in the database.
    /// </summary>
    public class TypesService : ServiceBase<Type, int, TypeEntry>
    {
        /// <summary>
        /// The generations service.
        /// </summary>
        private readonly GenerationsService GenerationsService;

        /// <summary>
        /// The version groups service.
        /// </summary>
        private readonly VersionGroupsService VersionGroupsService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public TypesService(
            IPokePlannerWebDbSettings settings,
            IPokeAPI pokeApi,
            GenerationsService generationsService,
            VersionGroupsService versionGroupsService,
            ILogger<TypesService> logger) : base(settings, pokeApi, logger)
        {
            GenerationsService = generationsService;
            VersionGroupsService = versionGroupsService;
        }

        /// <summary>
        /// Creates a connection to the Type collection in the database.
        /// </summary>
        protected override void SetCollection(IPokePlannerWebDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Collection = database.GetCollection<TypeEntry>(settings.TypesCollectionName);
        }

        #region CRUD methods

        /// <summary>
        /// Returns the Type with the given ID from the database.
        /// </summary>
        protected override TypeEntry Get(int typeId)
        {
            return Collection.Find(p => p.TypeId == typeId).FirstOrDefault();
        }

        /// <summary>
        /// Creates a new Type in the database and returns it.
        /// </summary>
        protected override TypeEntry Create(TypeEntry entry)
        {
            Collection.InsertOne(entry);
            return entry;
        }

        /// <summary>
        /// Removes the Type with the given ID from the database.
        /// </summary>
        protected override void Remove(int typeId)
        {
            Collection.DeleteOne(p => p.TypeId == typeId);
        }

        #endregion

        #region Entry conversion methods

        /// <summary>
        /// Returns the Type with the given ID.
        /// </summary>
        protected override async Task<Type> FetchSource(int typeId)
        {
            Logger.LogInformation($"Fetching type source object with ID {typeId}...");
            return await PokeApi.Get<Type>(typeId);
        }

        /// <summary>
        /// Returns a Type entry for the given Type.
        /// </summary>
        protected override async Task<TypeEntry> ConvertToEntry(Type type)
        {
            var displayNames = type.Names.ToDisplayNames();
            var efficacyMap = await GetEfficacyMap(type);
            var generation = await GenerationsService.Upsert(type.Generation);

            return new TypeEntry
            {
                TypeId = type.Id,
                Name = type.Name,
                DisplayNames = displayNames.ToList(),
                IsConcrete = type.Pokemon.Any(), // would like to use presence of move damage class but Fairy doesn't have it...
                EfficacyMap = efficacyMap,
                Generation = new Generation
                {
                    Id = generation.GenerationId,
                    Name = generation.Name
                }
            };
        }

        #endregion

        #region Public methods

        /// <summary>
        /// Returns all types.
        /// </summary>
        public async Task<TypeEntry[]> GetAll()
        {
            var allTypes = await UpsertAll();
            return allTypes.ToArray();
        }

        /// <summary>
        /// Returns all concrete types.
        /// </summary>
        public async Task<TypeEntry[]> GetConcrete()
        {
            var allTypes = await UpsertAll();
            return allTypes.Where(t => t.IsConcrete).ToArray();
        }

        /// <summary>
        /// Returns the type set for the version group with the given ID.
        /// </summary>
        public async Task<TypeSet> GetTypeSet(int versionGroupId)
        {
            var versionGroup = await VersionGroupsService.GetOrCreate(versionGroupId);
            var types = await GetConcrete();
            var typesArePresent = types.Select(t =>
            {
                var typeIsPresent = HasType(versionGroup.Generation, t);
                return new WithId<bool>(t.TypeId, typeIsPresent);
            });

            return new TypeSet
            {
                VersionGroupId = versionGroupId,
                TypeIds = types.Select(t => t.TypeId).ToArray(),
                TypesArePresent = typesArePresent.ToList()
            };
        }

        /// <summary>
        /// Returns the efficacy of the Type with the given ID in the version group with the given
        /// ID from the data store.
        /// </summary>
        public async Task<EfficacySet> GetTypesEfficacySet(IEnumerable<int> typeIds, int versionGroupId)
        {
            var entries = await GetOrCreateMany(typeIds);
            var efficacySets = entries.Select(e => e.GetEfficacySet(versionGroupId));
            return efficacySets.Aggregate((e1, e2) => e1.Product(e2));
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Returns true if the given generation uses the type with the given ID.
        /// </summary>
        private bool HasType(Generation generation, TypeEntry typeId)
        {
            return typeId.Generation.Id <= generation.Id;
        }

        /// <summary>
        /// Returns the efficacy of the given type in all version groups.
        /// </summary>
        private async Task<EfficacyMap> GetEfficacyMap(Type type)
        {
            var efficacy = new EfficacyMap();

            var versionGroups = await VersionGroupsService.GetAll();
            foreach (var vg in versionGroups)
            {
                var efficacySet = new EfficacySet();

                // populate damage relations - we can do this with the 'from' relations alone
                var damageRelations = await GetDamageRelations(type, vg.Key);

                foreach (var typeFrom in damageRelations.DoubleDamageFrom)
                {
                    // can't upsert due to infinite recursion...
                    // TODO: come up with a sensible solution
                    var o = await PokeApi.Get(typeFrom);
                    efficacySet.Add(o.Id, 2);
                }

                foreach (var typeFrom in damageRelations.HalfDamageFrom)
                {
                    var o = await PokeApi.Get(typeFrom);
                    efficacySet.Add(o.Id, 0.5);
                }

                foreach (var typeFrom in damageRelations.NoDamageFrom)
                {
                    var o = await PokeApi.Get(typeFrom);
                    efficacySet.Add(o.Id, 0);
                }

                efficacy.SetEfficacySet(vg.Key, efficacySet);
            }

            return efficacy;
        }

        /// <summary>
        /// Returns this type's damage relations in the version group with the given ID.
        /// </summary>
        private async Task<TypeRelations> GetDamageRelations(Type type, int versionGroupId)
        {
            if (versionGroupId == VersionGroupsService.NewestVersionGroupId)
            {
                return type.DamageRelations;
            }

            var versionGroup = await VersionGroupsService.GetOrCreate(versionGroupId);
            var pastDamageRelations = await GetPastDamageRelations(type, versionGroup.Generation);
            return pastDamageRelations ?? type.DamageRelations;
        }

        /// <summary>
        /// Returns this type's damage relations data for the given generation, if any.
        /// </summary>
        private async Task<TypeRelations> GetPastDamageRelations(Type type, Generation generation)
        {
            var pastDamageRelations = type.PastDamageRelations;
            var pastGenerations = await GenerationsService.UpsertMany(pastDamageRelations.Select(t => t.Generation));

            if (pastGenerations.Any())
            {
                // use the earliest generation after the given one with past damage relation data,
                // if it exists
                var laterGens = pastGenerations.Where(g => g.GenerationId >= generation.Id).ToList();
                if (laterGens.Any())
                {
                    var genToUse = laterGens.Aggregate((g, h) => g.Id < h.Id ? g : h);
                    return pastDamageRelations.Single(p => p.Generation.Name == genToUse.Name)
                                              .DamageRelations;
                }
            }

            return null;
        }

        #endregion
    }
    
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
        /// Gets or sets the type IDs.
        /// </summary>
        public int[] TypeIds { get; set; }

        /// <summary>
        /// Gets or sets whether the types are present.
        /// </summary>
        public List<WithId<bool>> TypesArePresent { get; set; }
    }
}
