using NUnit.Framework;
using PokePlannerWeb.Data.Mechanics;
using System.Threading.Tasks;

namespace PokePlannerWeb.Tests
{
    /// <summary>
    /// Tests for the <see cref="TypeData"/> singleton.
    /// </summary>
    public class TypeDataTests
    {
        /// <summary>
        /// Verifies that type efficacy loading works correctly.
        /// </summary>
        [Test]
        [Category("Integration")]
        public async Task TypeEfficacyLoadingTest()
        {
            // load type data
            await TypeData.Instance.LoadTypeData();

            // verify it's all loaded
            Assert.AreEqual(18, TypeData.Instance.EfficacyMapCount);
        }
    }
}
