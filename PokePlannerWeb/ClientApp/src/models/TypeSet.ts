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
    typeIds: number[]

    /**
     * Whether the types are present.
     */
    typesArePresent: any[]

    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param typeIds The IDs of the types.
     * @param typesArePresent Whether the types are present.
     */
    constructor(versionGroupId: number | undefined, typeIds: number[], typesArePresent: any[]) {
        this.versionGroupId = versionGroupId
        this.typeIds = typeIds
        this.typesArePresent = typesArePresent
    }
}