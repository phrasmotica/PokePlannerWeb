import { Encounter } from "./Encounter"
import { EncounterMethodEntry } from "./EncounterMethodEntry"
import { LocalString } from "./LocalString"
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
     * The ID of the location area of the encounter.
     */
    locationAreaId: number

    /**
     * The display names of the encounter.
     */
    displayNames: LocalString[]

    /**
     * The encounter chances indexed by version ID.
     */
    chances: WithId<number>[]

    /**
     * The details of the encounter indexed by version ID.
     */
    details: WithId<EncounterMethodDetails[]>[]

    /**
     * Constructor.
     */
    constructor(
        locationAreaId: number,
        displayNames: LocalString[],
        chances: WithId<number>[],
        details: WithId<EncounterMethodDetails[]>[]
    ) {
        this.locationAreaId = locationAreaId
        this.displayNames = displayNames
        this.chances = chances
        this.details = details
    }

    /**
     * Returns a encounter entry created from the given entry.
     */
    static from(encounter: EncounterEntry) {
        return new EncounterEntry(
            encounter.locationAreaId,
            encounter.displayNames,
            encounter.chances,
            encounter.details.map(e => new WithId<EncounterMethodDetails[]>(
                e.id,
                e.data.map(EncounterMethodDetails.from)
            ))
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

        return localName?.value
    }
}

/**
 * Represents details of an encounter method.
 */
export class EncounterMethodDetails {
    /**
     * The encounter method.
     */
    method: EncounterMethodEntry

    /**
     * The encounter details.
     */
    encounterDetails: Encounter[]

    /**
     * Constructor.
     */
    constructor(
        method: EncounterMethodEntry,
        encounterDetails: Encounter[]
    ) {
        this.method = method
        this.encounterDetails = encounterDetails
    }

    /**
     * Returns a encounter method details object created from the given object.
     */
    static from(encounter: EncounterMethodDetails) {
        return new EncounterMethodDetails(
            EncounterMethodEntry.from(encounter.method),
            encounter.encounterDetails
        )
    }
}