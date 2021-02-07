import { LocalString } from "./LocalString"

/**
 * Represents a location in the data store.
 */
export class LocationEntry {
    /**
     * The ID of the location.
     */
    locationId: number

    /**
     * The name of the location.
     */
    name: string

    /**
     * The display names of the location.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        locationId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.locationId = locationId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a location created from the given entry.
     */
    static from(location: LocationEntry) {
        return new LocationEntry(
            location.locationId,
            location.name,
            location.displayNames
        )
    }

    /**
     * Returns the location's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Location ${this.locationId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}