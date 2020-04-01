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
export interface EncounterEntry {
    /**
     * The display names of the encounter.
     */
    displayNames: DisplayName[]

    /**
     * The encounter chances indexed by version ID.
     */
    chances: WithId<number>[]
}