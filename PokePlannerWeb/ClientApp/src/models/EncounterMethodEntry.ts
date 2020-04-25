import { LocalString } from "./LocalString"

/**
 * Represents an encounter method in the data store.
 */
export class EncounterMethodEntry {
    /**
     * The ID of the type.
     */
    encounterMethodId: number

    /**
     * The name of the type.
     */
    name: string

    /**
     * The order of the encounter method.
     */
    order: number

    /**
     * The display names of the type.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        encounterMethodId: number,
        name: string,
        order: number,
        displayNames: LocalString[]
    ) {
        this.encounterMethodId = encounterMethodId
        this.name = name
        this.order = order
        this.displayNames = displayNames
    }

    /**
     * Returns an encounter method created from the given entry.
     */
    static from(method: EncounterMethodEntry) {
        return new EncounterMethodEntry(
            method.encounterMethodId,
            method.name,
            method.order,
            method.displayNames
        )
    }

    /**
     * Returns the method's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Encounter method ${this.encounterMethodId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}
