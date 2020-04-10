import { LocalString } from "./LocalString"
import { Generation } from "./Generation"
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
     * The IDs of the version groups where this species is valid.
     */
    validity: number[]

    /**
     * Constructor.
     */
    constructor(
        speciesId: number,
        name: string,
        displayNames: LocalString[],
        varieties: Pokemon[],
        generation: Generation,
        validity: number[]
    ) {
        this.speciesId = speciesId
        this.name = name
        this.displayNames = displayNames
        this.varieties = varieties
        this.generation = generation
        this.validity = validity
    }

    /**
     * Returns a Pokemon species entry created from the given entry.
     */
    static from(species: PokemonSpeciesEntry) {
        return new PokemonSpeciesEntry(
            species.speciesId,
            species.name,
            species.displayNames,
            species.varieties,
            species.generation,
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