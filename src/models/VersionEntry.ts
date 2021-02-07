import { LocalString } from "./LocalString"

/**
 * Represents a version in the data store.
 */
export class VersionEntry {
    /**
     * The ID of the version.
     */
    versionId: number

    /**
     * The name of the version.
     */
    name: string

    /**
     * The display names of the version.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        versionId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.versionId = versionId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a version created from the given entry.
     */
    static from(version: VersionEntry) {
        return new VersionEntry(
            version.versionId,
            version.name,
            version.displayNames
        )
    }

    /**
     * Returns the version's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Version ${this.versionId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}