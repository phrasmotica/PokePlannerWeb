import { IHasVersionGroup } from "../components/CommonMembers"
import { WithId } from "./WithId"

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
    presenceMap: WithId<boolean>[]

    /**
     * Default constructor.
     * @param versionGroupId The version group ID.
     * @param presenceMap Map of type presence..
     */
    constructor(versionGroupId: number | undefined, presenceMap: WithId<boolean>[]) {
        this.versionGroupId = versionGroupId
        this.presenceMap = presenceMap
    }
}