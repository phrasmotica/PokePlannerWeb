import { IHasVersionGroup } from "../components/CommonMembers"

/**
 * Class mapping types to whether they're present in a version group.
 */
export class TypesPresenceMap implements IHasVersionGroup {
    /**
     * The version group ID.
     */
    versionGroupId: number | undefined

    /**
     * Map of types by ID to whether it's present.
     */
    presenceMap: any[]

    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param presenceMap Map of type presence..
     */
    constructor(versionGroupId: number | undefined, presenceMap: any[]) {
        this.versionGroupId = versionGroupId
        this.presenceMap = presenceMap
    }
}