import { Move } from "./Move"
import { PokemonForm } from "./PokemonForm"
import { Type } from "./Type"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon in the data store.
 */
export class PokemonEntry {
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

    /**
     * The Pokemon's moves indexed by version group ID.
     */
    moves: WithId<Move[]>[]

    /**
     * Constructor.
     */
    constructor(
        pokemonId: number,
        name: string,
        spriteUrl: string,
        shinySpriteUrl: string,
        forms: PokemonForm[],
        types: WithId<Type[]>[],
        baseStats: WithId<number[]>[],
        moves: WithId<Move[]>[]
    ) {
        this.pokemonId = pokemonId
        this.name = name
        this.spriteUrl = spriteUrl
        this.shinySpriteUrl = shinySpriteUrl
        this.forms = forms
        this.types = types
        this.baseStats = baseStats
        this.moves = moves
    }

    /**
     * Returns a Pokemon entry created from the given entry.
     */
    static from(pokemon: PokemonEntry) {
        return new PokemonEntry(
            pokemon.pokemonId,
            pokemon.name,
            pokemon.spriteUrl,
            pokemon.shinySpriteUrl,
            pokemon.forms,
            pokemon.types,
            pokemon.baseStats,
            pokemon.moves
        )
    }

    /**
     * Returns the Pokemon's types in the version group with the given ID.
     */
    getTypes(versionGroupId: number): Type[] {
        let types = this.types.find(t => t.id === versionGroupId)
        return types?.data ?? []
    }

    /**
     * Returns the Pokemon's base stats in the version group with the given ID.
     */
    getBaseStats(versionGroupId: number): number[] {
        let baseStats = this.baseStats.find(t => t.id === versionGroupId)
        return baseStats?.data ?? []
    }
}