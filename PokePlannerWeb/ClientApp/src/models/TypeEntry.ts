import { LocalString } from "./LocalString"
import { EfficacyMap } from "./EfficacyMap"
import { Generation } from "./Generation"

/**
 * Represents a type in the data store.
 */
export interface TypeEntry {
    /**
     * The ID of the type.
     */
    typeId: number

    /**
     * The name of the type.
     */
    name: string

    /**
     * The display names of the type.
     */
    displayNames: LocalString[]

    /**
     * Whether the type is concrete.
     */
    isConcrete: boolean

    /**
     * The generation in which the type was introduced.
     */
    generation: Generation

    /**
     * The type's efficacy indexed by version group ID and then type ID.
     */
    efficacyMap: EfficacyMap
}