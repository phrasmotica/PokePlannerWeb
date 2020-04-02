using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PokePlannerWeb.Data;
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

            serviceCollection.AddSingleton<ILogger<PokeAPI>, NullLogger<PokeAPI>>();
            serviceCollection.AddSingleton<IPokeAPI, PokeAPI>();

            serviceCollection.AddSingleton<ILogger<StatsService>, NullLogger<StatsService>>();
            serviceCollection.AddSingleton<StatsService>();

            serviceCollection.AddSingleton<ILogger<GenerationsService>, NullLogger<GenerationsService>>();
            serviceCollection.AddSingleton<GenerationsService>();

            serviceCollection.AddSingleton<ILogger<PokedexesService>, NullLogger<PokedexesService>>();
            serviceCollection.AddSingleton<PokedexesService>();

            serviceCollection.AddSingleton<ILogger<VersionsService>, NullLogger<VersionsService>>();
            serviceCollection.AddSingleton<VersionsService>();

            serviceCollection.AddSingleton<ILogger<VersionGroupsService>, NullLogger<VersionGroupsService>>();
            serviceCollection.AddSingleton<VersionGroupsService>();

            serviceCollection.AddSingleton<ILogger<TypesService>, NullLogger<TypesService>>();
            serviceCollection.AddSingleton<TypesService>();

            return serviceCollection.BuildServiceProvider();
        }
    }
}
