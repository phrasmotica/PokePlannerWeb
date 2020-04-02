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
                dataStoreSourceFactory.Create<StatEntry>(dataStoreSettings.StatCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<StatService>, NullLogger<StatService>>();
            serviceCollection.AddSingleton<StatService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<GenerationEntry>(dataStoreSettings.GenerationCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<GenerationService>, NullLogger<GenerationService>>();
            serviceCollection.AddSingleton<GenerationService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<PokedexEntry>(dataStoreSettings.PokedexCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<PokedexService>, NullLogger<PokedexService>>();
            serviceCollection.AddSingleton<PokedexService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionEntry>(dataStoreSettings.VersionCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<VersionService>, NullLogger<VersionService>>();
            serviceCollection.AddSingleton<VersionService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<VersionGroupEntry>(dataStoreSettings.VersionGroupCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<VersionGroupService>, NullLogger<VersionGroupService>>();
            serviceCollection.AddSingleton<VersionGroupService>();

            serviceCollection.AddSingleton(sp =>
                dataStoreSourceFactory.Create<TypeEntry>(dataStoreSettings.TypeCollectionName)
            );
            serviceCollection.AddSingleton<ILogger<TypeService>, NullLogger<TypeService>>();
            serviceCollection.AddSingleton<TypeService>();

            return serviceCollection.BuildServiceProvider();
        }
    }
}
