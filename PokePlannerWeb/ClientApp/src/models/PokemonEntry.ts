import { PokemonForm } from "./PokemonForm"
import { Type } from "./Type"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon in the data store.
 */
export interface PokemonEntry {
    /**
     * The ID of the Pokemon.
     */
    pokemonId: number

    /**
     * The name of the Pokemon.
     */
    name: string

    /**
     * The URL of the Pokemon's front default sprite.
     */
    spriteUrl: string

    /**
     * The URL of the Pokemon's front shiny sprite.
     */
    shinySpriteUrl: string

    /**
     * The forms of the Pokemon.
     */
    forms: PokemonForm[]

    /**
     * The Pokemon's types indexed by version group ID.
    */
    types: WithId<Type[]>[]

    /**
     * The Pokemon's base stats indexed by version group ID.
     */
    baseStats: WithId<number[]>[]
}