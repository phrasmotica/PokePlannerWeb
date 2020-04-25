import { EvolutionChain } from "./EvolutionChain"
import { Generation } from "./Generation"
import { LocalString } from "./LocalString"
import { Pokemon } from "./Pokemon"
import { Type } from "./Type"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon species in the data store.
 */
export class PokemonSpeciesEntry {
    /**
     * The ID of the species.
     */
    speciesId: number

    /**
     * The name of the species.
     */
    name: string

    /**
     * The URL of the species' front default sprite.
     */
    spriteUrl: string

    /**
     * The URL of the species' front shiny sprite.
     */
    shinySpriteUrl: string

    /**
     * The display names of the species.
     */
    displayNames: LocalString[]

    /**
     * The genera of the species.
     */
    genera: LocalString[]

    /**
     * The flavour text entries of the species, indexed by version ID.
     */
    flavourTextEntries: WithId<LocalString[]>[]

    /**
     * The types of this species' primary variety indexed by version group ID.
    */
    types: WithId<Type[]>[]

    /**
     * The base stats of this species' primary variety indexed by version group ID.
     */
    baseStats: WithId<number[]>[]

    /**
     * The Pokemon this species represents.
     */
    varieties: Pokemon[]

    /**
     * The generation in which this species was introduced.
     */
    generation: Generation

    /**
     * The species' evolution chain.
     */
    evolutionChain: EvolutionChain

    /**
     * The IDs of the version groups where this species is valid.
     */
    validity: number[]

    /**
     * The species' catch rate.
     */
    catchRate: number

    /**
     * Constructor.
     */
    constructor(
        speciesId: number,
        name: string,
        spriteUrl: string,
        shinySpriteUrl: string,
        displayNames: LocalString[],
        genera: LocalString[],
        flavourTextEntries: WithId<LocalString[]>[],
        types: WithId<Type[]>[],
        baseStats: WithId<number[]>[],
        varieties: Pokemon[],
        generation: Generation,
        evolutionChain: EvolutionChain,
        validity: number[],
        catchRate: number
    ) {
        this.speciesId = speciesId
        this.name = name
        this.spriteUrl = spriteUrl
        this.shinySpriteUrl = shinySpriteUrl
        this.displayNames = displayNames
        this.genera = genera
        this.flavourTextEntries = flavourTextEntries
        this.types = types
        this.baseStats = baseStats
        this.varieties = varieties
        this.generation = generation
        this.evolutionChain = evolutionChain
        this.validity = validity
        this.catchRate = catchRate
    }

    /**
     * Returns a Pokemon species entry created from the given entry.
     */
    static from(species: PokemonSpeciesEntry) {
        return new PokemonSpeciesEntry(
            species.speciesId,
            species.name,
            species.spriteUrl,
            species.shinySpriteUrl,
            species.displayNames,
            species.genera,
            species.flavourTextEntries,
            species.types,
            species.baseStats,
            species.varieties,
            species.generation,
            species.evolutionChain,
            species.validity,
            species.catchRate
        )
    }

    /**
     * Returns the species' display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            // species should have display names in every locale so throw an error
            throw new Error(
                `Pokemon species ${this.speciesId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }

    /**
     * Returns the species' genus in the given locale.
     */
    getGenus(locale: string): string | undefined {
        let localName = this.genera.find(n => n.language === locale)
        if (localName === undefined) {
            // species should have genus in every locale so throw an error
            throw new Error(
                `Species ${this.speciesId} is missing genus in locale '${locale}'`
            )
        }

        return localName?.value
    }

    /**
     * Returns the species' flavour text in the version with the given ID in the given locale.
     */
    getFlavourText(versionId: number, locale: string): string | undefined {
        if (this.flavourTextEntries.length <= 0) {
            console.warn(
                `Species ${this.speciesId} has no flavour text entries`
            )

            return undefined
        }

        // find most recent flavour text entry
        let matchFunc = (searchId: number) => this.flavourTextEntries.find(e => e.id === searchId)

        let searchId = versionId
        let matchingEntry: WithId<LocalString[]> | undefined = undefined
        while (matchingEntry === undefined && searchId > 0) {
            matchingEntry = matchFunc(searchId)
            searchId--
        }

        if (matchingEntry === undefined) {
            // older version than the earliest one with flavour text...
            // fall back to that one
            matchingEntry = this.flavourTextEntries[0]
        }

        let localFlavourText = matchingEntry!.data.find(n => n.language === locale)
        if (localFlavourText === undefined) {
            console.warn(
                `Species ${this.speciesId} is missing flavour text in locale '${locale}'`
            )
        }

        return localFlavourText?.value
    }

    /**
     * Returns the species' types in the version group with the given ID.
     */
    getTypes(versionGroupId: number): Type[] {
        let types = this.types
        if (types.length <= 0) {
            throw new Error(`Species ${this.speciesId} has no type entries`)
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
                `Species ${this.speciesId} has no type data for the newest version group (${newestVersionGroupId})`
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

    /**
     * Returns whether the species is valid in the version group with the given ID.
     */
    isValid(versionGroupId: number): boolean {
        return this.validity.includes(versionGroupId)
    }
}