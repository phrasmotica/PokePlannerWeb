import { LocalString } from "./LocalString"
import { GenerationEntry } from "./GenerationEntry"
import { PokedexEntry } from "./PokedexEntry"
import { VersionEntry } from "./VersionEntry"

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
    generation: GenerationEntry

    /**
     * The versions belonging to the version group.
     */
    versions: VersionEntry[]

    /**
     * The Pokedexes present in the version group.
     */
    pokedexes: PokedexEntry[]

    /**
     * Constructor.
     */
    constructor(
        versionGroupId: number,
        name: string,
        order: number,
        displayNames: LocalString[],
        generation: GenerationEntry,
        versions: VersionEntry[],
        pokedexes: PokedexEntry[]
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
            versionGroup.versions.map(VersionEntry.from),
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

        return localName?.value
    }
}