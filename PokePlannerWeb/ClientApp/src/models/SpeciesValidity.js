"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enum representing the validity of a Pokemon species.
 */
var SpeciesValidity;
(function (SpeciesValidity) {
    /**
     * The species is present in the current game version.
     */
    SpeciesValidity[SpeciesValidity["Valid"] = 0] = "Valid";
    /**
     * The species exists bit is absent from the current game version.
     */
    SpeciesValidity[SpeciesValidity["Invalid"] = 1] = "Invalid";
    /**
     * The species does not exist.
     */
    SpeciesValidity[SpeciesValidity["Nonexistent"] = 2] = "Nonexistent";
})(SpeciesValidity = exports.SpeciesValidity || (exports.SpeciesValidity = {}));
//# sourceMappingURL=SpeciesValidity.js.map