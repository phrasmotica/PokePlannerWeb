import { DisplayName } from "./DisplayName"
import { Type } from "./Type"
import { VersionGroup } from "./VersionGroup"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon form in the data store.
 */
export interface PokemonFormEntry {
    /**
     * The ID of the Pokemon form.
     */
    formId: number

    /**
     * The name of the Pokemon form.
     */
    name: string

    /**
     * Whether the Pokemon form is a mega evolution.
     */
    isMega: boolean

    /**
     * The display names of the Pokemon form.
     */
    displayNames: DisplayName[]

    /**
     * The version group in which the Pokemon form was introduced.
     */
    versionGroup: VersionGroup

    /**
     * The URL of the Pokemon form's front default sprite.
     */
    spriteUrl: string

    /**
     * The URL of the Pokemon form's front shiny sprite.
     */
    shinySpriteUrl: string

    /**
     * The Pokemon form's types indexed by version group ID.
    */
    types: WithId<Type[]>[]

    /**
     * The IDs of the version groups where this Pokemon form is valid.
     */
    validity: number[]
}