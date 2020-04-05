using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PokeApiNet;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Cache;
using PokePlannerWeb.Data.Cache.Abstractions;
using PokePlannerWeb.Data.Cache.Services;
using PokePlannerWeb.Data.DataStore;
using PokePlannerWeb.Data.DataStore.Abstractions;
using PokePlannerWeb.Data.DataStore.Models;
using PokePlannerWeb.Data.DataStore.Services;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Helper class for writing tests.
    /// </summary>
    public class TestHelper
    {
        /// <summary>
        /// The Configuration.
        /// </summary>
        private static IConfiguration Configuration;

        /// <summary>
        /// Creates a service provider for tests.
        /// </summary>
        public static IServiceProvider BuildServiceProvider()
        {
            var services = new ServiceCollection();

            Configuration = new ConfigurationBuilder().AddJsonFile("appsettings.test.json").Build();

            // configure PokeAPI services
            services.AddSingleton<PokeApiClient>();
            services.AddSingleton<ILogger<PokeAPI>, NullLogger<PokeAPI>>();
            services.AddSingleton<IPokeAPI, PokeAPI>();

            ConfigureDataStore(services);

            ConfigureCache(services);

            return services.BuildServiceProvider();
        }

        /// <summary>
        /// Configures services for accessing the data store.
        /// </summary>
        private static void ConfigureDataStore(IServiceCollection services)
        {
            // bind data store settings
            services.Configure<DataStoreSettings>(
                Configuration.GetSection(nameof(DataStoreSettings))
            );

            // create singleton for data store settings
            services.AddSingleton<IDataStoreSettings>(sp =>
                sp.GetRequiredService<IOptions<DataStoreSettings>>().Value
            );

            // create data store services
            var dataStoreSourceFactory = new DataStoreSourceFactory();
            var dataStoreSettings = Configuration.GetSection(nameof(DataStoreSettings)).Get<DataStoreSettings>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<StatEntry>(dataStoreSettings.StatCollectionName)
            );
            services.AddSingleton<ILogger<StatService>, NullLogger<StatService>>();
            services.AddSingleton<StatService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<GenerationEntry>(dataStoreSettings.GenerationCollectionName)
            );
            services.AddSingleton<ILogger<GenerationService>, NullLogger<GenerationService>>();
            services.AddSingleton<GenerationService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokedexEntry>(dataStoreSettings.PokedexCollectionName)
            );
            services.AddSingleton<ILogger<PokedexService>, NullLogger<PokedexService>>();
            services.AddSingleton<PokedexService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionEntry>(dataStoreSettings.VersionCollectionName)
            );
            services.AddSingleton<ILogger<VersionService>, NullLogger<VersionService>>();
            services.AddSingleton<VersionService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionGroupEntry>(dataStoreSettings.VersionGroupCollectionName)
            );
            services.AddSingleton<ILogger<VersionGroupService>, NullLogger<VersionGroupService>>();
            services.AddSingleton<VersionGroupService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<TypeEntry>(dataStoreSettings.TypeCollectionName)
            );
            services.AddSingleton<ILogger<TypeService>, NullLogger<TypeService>>();
            services.AddSingleton<TypeService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<MoveEntry>(dataStoreSettings.MoveCollectionName)
            );
            services.AddSingleton<ILogger<MoveService>, NullLogger<MoveService>>();
            services.AddSingleton<MoveService>();

            services.AddSingleton(sp =>
                dataStoreSourceFactory.Create<MoveDamageClassEntry>(dataStoreSettings.MoveDamageClassCollectionName)
            );
            services.AddSingleton<ILogger<TypeService>, NullLogger<TypeService>>();
            services.AddSingleton<MoveDamageClassService>();
        }

        /// <summary>
        /// Configures services for accessing the cache.
        /// </summary>
        private static void ConfigureCache(IServiceCollection services)
        {
            // bind cache settings
            services.Configure<CacheSettings>(
                Configuration.GetSection(nameof(CacheSettings))
            );

            // create singleton for cache settings
            services.AddSingleton<ICacheSettings>(sp =>
                sp.GetRequiredService<IOptions<CacheSettings>>().Value
            );

            // create cache services
            var cacheSourceFactory = new CacheSourceFactory();
            var cacheSettings = Configuration.GetSection(nameof(CacheSettings)).Get<CacheSettings>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Generation>(cacheSettings.GenerationCollectionName)
            );
            services.AddSingleton<GenerationCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<LocationArea>(cacheSettings.LocationAreaCollectionName)
            );
            services.AddSingleton<LocationAreaCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Location>(cacheSettings.LocationCollectionName)
            );
            services.AddSingleton<LocationCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Move>(cacheSettings.MoveCollectionName)
            );
            services.AddSingleton<MoveCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<MoveDamageClass>(cacheSettings.MoveDamageClassCollectionName)
            );
            services.AddSingleton<MoveDamageClassCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Pokedex>(cacheSettings.PokedexCollectionName)
            );
            services.AddSingleton<PokedexCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Pokemon>(cacheSettings.PokemonCollectionName)
            );
            services.AddSingleton<PokemonCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokemonForm>(cacheSettings.PokemonFormCollectionName)
            );
            services.AddSingleton<PokemonFormCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokemonSpecies>(cacheSettings.PokemonSpeciesCollectionName)
            );
            services.AddSingleton<PokemonSpeciesCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<Stat>(cacheSettings.StatCollectionName)
            );
            services.AddSingleton<StatCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokeApiNet.Type>(cacheSettings.TypeCollectionName)
            );
            services.AddSingleton<TypeCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<PokeApiNet.Version>(cacheSettings.VersionCollectionName)
            );
            services.AddSingleton<VersionCacheService>();

            services.AddSingleton(sp =>
                cacheSourceFactory.Create<VersionGroup>(cacheSettings.VersionGroupCollectionName)
            );
            services.AddSingleton<VersionGroupCacheService>();
        }
    }
}
