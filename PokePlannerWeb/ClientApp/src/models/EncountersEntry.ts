import { DisplayName } from "./DisplayName"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon's encounters in the data store.
 */
export interface EncountersEntry {
    /**
     * The ID of the Pokemon.
     */
    pokemonId: number

    /**
     * The encounters indexed by version group ID.
     */
    encounters: WithId<EncounterEntry[]>[]
}

/**
 * Represents an encounter in the data store.
 */
export class EncounterEntry {
    /**
     * The display names of the encounter.
     */
    displayNames: DisplayName[]

    /**
     * The encounter chances indexed by version ID.
     */
    chances: WithId<number>[]

    /**
     * Constructor.
     */
    constructor(
        displayNames: DisplayName[],
        chances: WithId<number>[]
    ) {
        this.displayNames = displayNames
        this.chances = chances
    }

    /**
     * Returns a encounter entry created from the given entry.
     */
    static from(encounter: EncounterEntry) {
        return new EncounterEntry(
            encounter.displayNames,
            encounter.chances
        )
    }

    /**
     * Returns the encounter's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(`Encounter is missing display name in locale '${locale}'`)
        }

        return localName?.name
    }
}