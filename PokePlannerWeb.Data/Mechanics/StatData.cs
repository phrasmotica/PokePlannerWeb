using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using PokeApiNet;
using PokePlannerWeb.Data.Extensions;

namespace PokePlannerWeb.Data.Mechanics
{
    /// <summary>
    /// For stat information and calculations.
    /// </summary>
    public class StatData : ResourceData<Stat>
    {
        /// <summary>
        /// Constructor.
        /// </summary>
        public StatData(IPokeAPI pokeApi, ILogger<StatData> logger) : base(pokeApi, logger)
        {
        }

        /// <summary>
        /// Gets or sets the stats.
        /// </summary>
        public Stat[] Stats
        {
            get => Data;
            set => Data = value;
        }

        /// <summary>
        /// Returns the names of the base stats in the version group with the given ID.
        /// </summary>
        public IEnumerable<string> GetBaseStatNames(int versionGroupId)
        {
            // FUTURE: anticipating a generation-based base stats changelog

            return Stats.Where(s => !s.IsBattleOnly)
                        .Select(s => s.Names.GetName());
        }
    }
}
