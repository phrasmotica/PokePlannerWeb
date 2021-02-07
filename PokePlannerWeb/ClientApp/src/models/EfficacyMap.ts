import { WithId } from "./WithId"

export interface EfficacyMap {
    /**
     * The type's efficacy indexed by version group ID and then type ID.
     */
    efficacySets: WithId<EfficacySet>[]
}

export interface EfficacySet {
    /**
     * The efficacy multipliers.
     */
    efficacyMultipliers: WithId<number>[]
}