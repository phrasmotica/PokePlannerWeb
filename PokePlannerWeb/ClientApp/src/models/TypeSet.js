"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class mapping types to whether they're present in a version group.
 */
var TypeSet = /** @class */ (function () {
    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param types The types.
     * @param typesArePresent Whether the types are present.
     */
    function TypeSet(versionGroupId, types, typesArePresent) {
        this.versionGroupId = versionGroupId;
        this.types = types;
        this.typesArePresent = typesArePresent;
    }
    return TypeSet;
}());
exports.TypeSet = TypeSet;
//# sourceMappingURL=TypeSet.js.map