import { LocalString } from "./LocalString"

/**
 * Represents a pokedex in the data store.
 */
export class PokedexEntry {
    /**
     * The pokedex's ID.
     */
    pokedexId: number

    /**
     * The name of the pokedex.
     */
    name: string

    /**
     * The pokedex's display names.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        pokedexId: number,
        name: string,
        displayNames: LocalString[],
    ) {
        this.pokedexId = pokedexId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a pokedex created from the given entry.
     */
    static from(pokedex: PokedexEntry) {
        return new PokedexEntry(
            pokedex.pokedexId,
            pokedex.name,
            pokedex.displayNames,
        )
    }

    /**
     * Returns the stat's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Stat ${this.pokedexId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}