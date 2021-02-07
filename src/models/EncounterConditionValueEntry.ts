import { LocalString } from "./LocalString"

/**
 * Represents an encounter condition value in the data store.
 */
export class EncounterConditionValueEntry {
    /**
     * The ID of the encounter condition value.
     */
    encounterConditionValueId: number

    /**
     * The name of the encounter condition value.
     */
    name: string

    /**
     * The order of the encounter condition value.
     */
    order: number

    /**
     * The display names of the encounter condition value.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        encounterConditionValueId: number,
        name: string,
        order: number,
        displayNames: LocalString[]
    ) {
        this.encounterConditionValueId = encounterConditionValueId
        this.name = name
        this.order = order
        this.displayNames = displayNames
    }

    /**
     * Returns an encounter condition value created from the given entry.
     */
    static from(conditionValue: EncounterConditionValueEntry) {
        return new EncounterConditionValueEntry(
            conditionValue.encounterConditionValueId,
            conditionValue.name,
            conditionValue.order,
            conditionValue.displayNames
        )
    }

    /**
     * Returns the encounter condition value's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Encounter condition value ${this.encounterConditionValueId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}
