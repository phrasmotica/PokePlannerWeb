using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using PokePlannerWeb.Data;
using PokePlannerWeb.Data.Mechanics;
using PokePlannerWeb.Data.Types;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Tests for the <see cref="TypeData"/> singleton.
    /// </summary>
    public class TypeDataTests
    {
        /// <summary>
        /// The service provider.
        /// </summary>
        private IServiceProvider serviceProvider;

        /// <summary>
        /// Setup hook.
        /// </summary>
        [OneTimeSetUp]
        public void Setup()
        {
            var serviceCollection = new ServiceCollection();

            serviceCollection.AddSingleton<ILogger<PokeAPI>, NullLogger<PokeAPI>>();
            serviceCollection.AddSingleton<IPokeAPI, PokeAPI>();

            serviceCollection.AddSingleton<ILogger<VersionGroupData>, NullLogger<VersionGroupData>>();
            serviceCollection.AddSingleton<VersionGroupData>();

            serviceCollection.AddSingleton<ILogger<TypeData>, NullLogger<TypeData>>();
            serviceCollection.AddSingleton<TypeData>();

            serviceProvider = serviceCollection.BuildServiceProvider();
        }

        /// <summary>
        /// Verifies that type efficacy loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task TypeEfficacyLoadingTest()
        {
            // load type data
            var typeData = serviceProvider.GetService<TypeData>();
            await typeData.LoadTypeEfficacy();

            // verify it's all loaded
            Assert.AreEqual(18, typeData.EfficacyMapCount);
        }
    }
}
