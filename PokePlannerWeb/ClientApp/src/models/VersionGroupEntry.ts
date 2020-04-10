import { LocalString } from "./DisplayName"
import { Generation } from "./Generation"
import { Pokedex } from "./Pokedex"
import { Version } from "./Version"

/**
 * Represents a version group in the data store.
 */
export class VersionGroupEntry {
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
    displayNames: LocalString[]

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

    /**
     * Constructor.
     */
    constructor(
        versionGroupId: number,
        name: string,
        order: number,
        displayNames: LocalString[],
        generation: Generation,
        versions: Version[],
        pokedexes: Pokedex[]
    ) {
        this.versionGroupId = versionGroupId
        this.name = name
        this.order = order
        this.displayNames = displayNames
        this.generation = generation
        this.versions = versions
        this.pokedexes = pokedexes
    }

    /**
     * Returns a version group entry created from the given entry.
     */
    static from(versionGroup: VersionGroupEntry) {
        return new VersionGroupEntry(
            versionGroup.versionGroupId,
            versionGroup.name,
            versionGroup.order,
            versionGroup.displayNames,
            versionGroup.generation,
            versionGroup.versions,
            versionGroup.pokedexes
        )
    }

    /**
     * Returns the version group's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Version group ${this.versionGroupId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.name
    }
}