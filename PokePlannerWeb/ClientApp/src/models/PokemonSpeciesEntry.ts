import { DisplayName } from "./DisplayName"
import { Pokemon } from "./Pokemon"

/**
 * Represents a Pokemon species in the data store.
 */
export interface PokemonSpeciesEntry {
    /**
     * The ID of the species.
     */
    speciesId: number

    /**
     * The name of the species.
     */
    name: string

    /**
     * The display names of the species.
     */
    displayNames: DisplayName[]

    /**
     * The Pokemon this species represents.
     */
    varieties: Pokemon[]

    /**
     * The IDs of the version groups where this species is valid.
     */
    validity: number[]
}