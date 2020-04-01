import { DisplayName } from "./DisplayName"
import { Generation } from "./Generation"
import { Pokedex } from "./Pokedex"
import { Version } from "./Version"

/**
 * Represents a version group in the data store.
 */
export interface VersionGroupEntry {
    /**
     * The ID of the version group.
     */
    versionGroupId: number

    /**
     * The name of the version group.
     */
    name: string

    /**
     * The order of the version group.
     */
    order: number

    /**
     * The display names of the version group.
     */
    displayNames: DisplayName[]

    /**
     * The generation the version group belongs to.
     */
    generation: Generation

    /**
     * The versions belonging to the version group.
     */
    versions: Version[]

    /**
     * The Pokedexes present in the version group.
     */
    pokedexes: Pokedex[]
}