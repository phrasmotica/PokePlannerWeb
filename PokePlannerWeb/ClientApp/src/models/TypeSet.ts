/**
 * Class mapping types to whether they're present in a version group.
 */
export class TypeSet {
    /**
     * The version group ID.
     */
    versionGroupId: number;

    /**
     * The types.
     */
    types: string[];

    /**
     * Whether the types are present.
     */
    typesArePresent: boolean[];

    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param types The types.
     * @param typesArePresent Whether the types are present.
     */
    constructor(versionGroupId: number, types: string[], typesArePresent: boolean[]) {
        this.versionGroupId = versionGroupId
        this.types = types
        this.typesArePresent = typesArePresent
    }
}