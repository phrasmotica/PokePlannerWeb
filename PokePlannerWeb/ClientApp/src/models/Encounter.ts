import { EncounterConditionValue } from "./EncounterConditionValue"
import { EncounterMethod } from "./EncounterMethod"

/**
 * Represents an encounter.
 */
export interface Encounter {
    /**
     * The chance of the encounter.
     */
    chance: number

    /**
     * The condition values of the encounter.
     */
    conditionValues: EncounterConditionValue[]

    /**
     * The minimum level of the encounter.
     */
    minLevel: number

    /**
     * The maximum level of the encounter.
     */
    maxLevel: number

    /**
     * The method of the encounter.
     */
    method: EncounterMethod | null
}