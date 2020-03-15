import { IHasVersionGroup } from "../components/CommonMembers"

/**
 * Class mapping types to whether they're present in a version group.
 */
export class TypeSet implements IHasVersionGroup {
    /**
     * The version group ID.
     */
    versionGroupId: number | undefined

    /**
     * The types.
     */
    types: string[]

    /**
     * Whether the types are present.
     */
    typesArePresent: boolean[]

    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param types The types.
     * @param typesArePresent Whether the types are present.
     */
    constructor(versionGroupId: number | undefined, types: string[], typesArePresent: boolean[]) {
        this.versionGroupId = versionGroupId
        this.types = types
        this.typesArePresent = typesArePresent
    }
}