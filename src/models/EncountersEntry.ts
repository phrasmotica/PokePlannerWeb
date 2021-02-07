import { EncounterConditionValueEntry } from "./EncounterConditionValueEntry"
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
     * The details of the encounter indexed by version ID.
     */
    details: WithId<EncounterMethodDetails[]>[]

    /**
     * Constructor.
     */
    constructor(
        locationAreaId: number,
        displayNames: LocalString[],
        details: WithId<EncounterMethodDetails[]>[]
    ) {
        this.locationAreaId = locationAreaId
        this.displayNames = displayNames
        this.details = details
    }

    /**
     * Returns a encounter entry created from the given entry.
     */
    static from(encounter: EncounterEntry) {
        return new EncounterEntry(
            encounter.locationAreaId,
            encounter.displayNames,
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
    conditionValuesDetails: ConditionValuesDetail[]

    /**
     * Constructor.
     */
    constructor(
        method: EncounterMethodEntry,
        conditionValuesDetails: ConditionValuesDetail[]
    ) {
        this.method = method
        this.conditionValuesDetails = conditionValuesDetails
    }

    /**
     * Returns a encounter method details object created from the given object.
     */
    static from(encounter: EncounterMethodDetails) {
        return new EncounterMethodDetails(
            EncounterMethodEntry.from(encounter.method),
            encounter.conditionValuesDetails.map(ConditionValuesDetail.from)
        )
    }
}

/**
 * Model for a list of encounter details under a given set of conditions.
 */
export class ConditionValuesDetail {
    /**
     * The condition values required for the encounters to occur.
     */
    conditionValues: EncounterConditionValueEntry[]

    /**
     * The encounter details.
     */
    encounterDetails: EncounterDetailEntry[]

    /**
     * Constructor.
     */
    constructor(
        conditionValues: EncounterConditionValueEntry[],
        encounterDetails: EncounterDetailEntry[]
    ) {
        this.conditionValues = conditionValues
        this.encounterDetails = encounterDetails
    }

    /**
     * Returns an encounter detail created from the given entry.
     */
    static from(detail: ConditionValuesDetail) {
        return new ConditionValuesDetail(
            detail.conditionValues.map(EncounterConditionValueEntry.from),
            detail.encounterDetails.map(EncounterDetailEntry.from)
        )
    }
}

/**
 * Represents an encounter.
 */
export class EncounterDetailEntry {
    /**
     * The chance of the encounter.
     */
    chance: number

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
        minLevel: number,
        maxLevel: number
    ) {
        this.chance = chance
        this.minLevel = minLevel
        this.maxLevel = maxLevel
    }

    /**
     * Returns an encounter detail created from the given entry.
     */
    static from(detail: EncounterDetailEntry) {
        return new EncounterDetailEntry(
            detail.chance,
            detail.minLevel,
            detail.maxLevel
        )
    }
}