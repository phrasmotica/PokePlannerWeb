import { EncounterConditionValueEntry } from "./EncounterConditionValueEntry"

/**
 * Represents an encounter.
 */
export class EncounterDetailEntry {
    /**
     * The chance of the encounter.
     */
    chance: number

    /**
     * The condition values of the encounter.
     */
    conditionValues: EncounterConditionValueEntry[]

    /**
     * The minimum level of the encounter.
     */
    minLevel: number

    /**
     * The maximum level of the encounter.
     */
    maxLevel: number

    /**
     * Constructor.
     */
    constructor(
        chance: number,
        conditionValues: EncounterConditionValueEntry[],
        minLevel: number,
        maxLevel: number
    ) {
        this.chance = chance
        this.conditionValues = conditionValues
        this.minLevel = minLevel
        this.maxLevel = maxLevel
    }

    /**
     * Returns an encounter detail created from the given entry.
     */
    static from(detail: EncounterDetailEntry) {
        return new EncounterDetailEntry(
            detail.chance,
            detail.conditionValues.map(EncounterConditionValueEntry.from),
            detail.minLevel,
            detail.maxLevel
        )
    }
}