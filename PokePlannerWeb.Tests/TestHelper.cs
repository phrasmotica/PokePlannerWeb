using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PokeApiNet;
using PokePlannerWeb.Data;
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
        /// Creates a service provider for tests.
        /// </summary>
        public static IServiceProvider BuildServiceProvider()
        {
            var serviceCollection = new ServiceCollection();

            IConfiguration configuration = new ConfigurationBuilder().AddJsonFile("appsettings.test.json").Build();

            // bind database settings
            serviceCollection.Configure<DataStoreSettings>(
                configuration.GetSection(nameof(DataStoreSettings))
            );

            // create singleton for database settings
            serviceCollection.AddSingleton<IDataStoreSettings>(sp =>
                sp.GetRequiredService<IOptions<DataStoreSettings>>().Value
            );

            // create data store services
            var dataStoreSettings = configuration.GetSection(nameof(DataStoreSettings)).Get<DataStoreSettings>();
            var dataStoreSourceFactory = new DataStoreSourceFactory(dataStoreSettings.ConnectionString, dataStoreSettings.DatabaseName);

            serviceCollection.AddSingleton<PokeApiClient>();
            serviceCollection.AddSingleton<ILogger<PokeAPI>, NullLogger<PokeAPI>>();
            serviceCollection.AddSingleton<IPokeAPI, PokeAPI>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<StatEntry>(dataStoreSettings.StatsCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<StatsService>, NullLogger<StatsService>>();
            serviceCollection.AddSingleton<StatsService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<GenerationEntry>(dataStoreSettings.GenerationsCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<GenerationsService>, NullLogger<GenerationsService>>();
            serviceCollection.AddSingleton<GenerationsService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokedexEntry>(dataStoreSettings.PokedexesCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<PokedexesService>, NullLogger<PokedexesService>>();
            serviceCollection.AddSingleton<PokedexesService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionEntry>(dataStoreSettings.VersionsCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<VersionsService>, NullLogger<VersionsService>>();
            serviceCollection.AddSingleton<VersionsService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionGroupEntry>(dataStoreSettings.VersionGroupsCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<VersionGroupsService>, NullLogger<VersionGroupsService>>();
            serviceCollection.AddSingleton<VersionGroupsService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<TypeEntry>(dataStoreSettings.TypesCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<TypesService>, NullLogger<TypesService>>();
            serviceCollection.AddSingleton<TypesService>();

            return serviceCollection.BuildServiceProvider();
        }
    }
}
