import { Ability } from "./Ability"
import { VersionHeldItemContext } from "./ItemEntry"
import { LocalString } from "./LocalString"
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
     * The display names of the Pokemon's primary form.
     */
    displayNames: LocalString[]

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
     * The Pokemon's abilities.
    */
    abilities: Ability[]

    /**
     * The Pokemon's base stats indexed by version group ID.
     */
    baseStats: WithId<number[]>[]

    /**
     * The Pokemon's moves indexed by version group ID.
     */
    moves: WithId<Move[]>[]

    /**
     * The Pokemon's moves indexed by version ID.
     */
    heldItems: WithId<VersionHeldItemContext[]>[]

    /**
     * Constructor.
     */
    constructor(
        pokemonId: number,
        name: string,
        displayNames: LocalString[],
        spriteUrl: string,
        shinySpriteUrl: string,
        forms: PokemonForm[],
        types: WithId<Type[]>[],
        abilities: Ability[],
        baseStats: WithId<number[]>[],
        moves: WithId<Move[]>[],
        heldItems: WithId<VersionHeldItemContext[]>[]
    ) {
        this.pokemonId = pokemonId
        this.name = name
        this.displayNames = displayNames
        this.spriteUrl = spriteUrl
        this.shinySpriteUrl = shinySpriteUrl
        this.forms = forms
        this.types = types
        this.abilities = abilities
        this.baseStats = baseStats
        this.moves = moves
        this.heldItems = heldItems
    }

    /**
     * Returns a Pokemon entry created from the given entry.
     */
    static from(pokemon: PokemonEntry) {
        return new PokemonEntry(
            pokemon.pokemonId,
            pokemon.name,
            pokemon.displayNames,
            pokemon.spriteUrl,
            pokemon.shinySpriteUrl,
            pokemon.forms,
            pokemon.types,
            pokemon.abilities,
            pokemon.baseStats,
            pokemon.moves,
            pokemon.heldItems
        )
    }

    /**
     * Returns whether the Pokemon has display names.
     */
    hasDisplayNames() {
        return this.displayNames.length > 0
    }

    /**
     * Returns the Pokemon's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Pokemon ${this.pokemonId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }

    /**
     * Returns the Pokemon's types in the version group with the given ID.
     */
    getTypes(versionGroupId: number): Type[] {
        let types = this.types
        if (types.length <= 0) {
            throw new Error(`Pokemon ${this.pokemonId} has no type entries`)
        }

        let newestVersionGroupId = types.reduce((t1, t2) => t1.id > t2.id ? t1 : t2).id

        // find first types entry with a version group ID after the one we're looking so
        let matchFunc = (searchId: number) => types.find(e => e.id === searchId)

        let searchId = versionGroupId
        let matchingEntry: WithId<Type[]> | undefined = undefined
        while (matchingEntry === undefined && searchId <= newestVersionGroupId) {
            matchingEntry = matchFunc(searchId)
            searchId++
        }

        if (matchingEntry === undefined) {
            throw new Error(
                `Pokemon ${this.pokemonId} has no type data for the newest version group (${newestVersionGroupId})`
            )
        }

        return matchingEntry.data
    }

    /**
     * Returns the Pokemon's base stats in the version group with the given ID.
     */
    getBaseStats(versionGroupId: number): number[] {
        let baseStats = this.baseStats.find(t => t.id === versionGroupId)
        return baseStats?.data ?? []
    }
}