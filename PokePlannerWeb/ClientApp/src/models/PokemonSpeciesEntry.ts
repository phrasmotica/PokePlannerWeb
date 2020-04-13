import { EvolutionChain } from "./EvolutionChain"
import { Generation } from "./Generation"
import { LocalString } from "./LocalString"
import { Pokemon } from "./Pokemon"

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
     * Constructor.
     */
    constructor(
        speciesId: number,
        name: string,
        spriteUrl: string,
        shinySpriteUrl: string,
        displayNames: LocalString[],
        varieties: Pokemon[],
        generation: Generation,
        evolutionChain: EvolutionChain,
        validity: number[]
    ) {
        this.speciesId = speciesId
        this.name = name
        this.spriteUrl = spriteUrl
        this.shinySpriteUrl = shinySpriteUrl
        this.displayNames = displayNames
        this.varieties = varieties
        this.generation = generation
        this.evolutionChain = evolutionChain
        this.validity = validity
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
            species.varieties,
            species.generation,
            species.evolutionChain,
            species.validity
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
     * Returns whether the species is valid in the version group with the given ID.
     */
    isValid(versionGroupId: number): boolean {
        return this.validity.includes(versionGroupId)
    }
}