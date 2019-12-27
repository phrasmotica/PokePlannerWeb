"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enum representing the validity of a Pokemon.
 */
var PokemonValidity;
(function (PokemonValidity) {
    /**
     * The Pokemon is present in the current game version.
     */
    PokemonValidity[PokemonValidity["Valid"] = 0] = "Valid";
    /**
     * The Pokemon exists but is absent from the current game version.
     */
    PokemonValidity[PokemonValidity["Invalid"] = 1] = "Invalid";
    /**
     * The Pokemon does not exist.
     */
    PokemonValidity[PokemonValidity["Nonexistent"] = 2] = "Nonexistent";
})(PokemonValidity = exports.PokemonValidity || (exports.PokemonValidity = {}));
//# sourceMappingURL=PokemonValidity.js.map