import { LocalString } from "./DisplayName"

/**
 * Represents a generation in the data store.
 */
export class GenerationEntry {
    /**
     * The ID of the generation.
     */
    generationId: number

    /**
     * The name of the generation.
     */
    name: string

    /**
     * The display names of the generation.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        generationId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.generationId = generationId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a generation entry created from the given entry.
     */
    static from(generation: GenerationEntry) {
        return new GenerationEntry(
            generation.generationId,
            generation.name,
            generation.displayNames
        )
    }

    /**
     * Returns the generation's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Generation ${this.generationId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.name
    }

    /**
     * Returns the generation's short display name in the given locale.
     */
    getShortDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Generation ${this.generationId} is missing display name in locale '${locale}'`
            )
        }

        if (locale === "en") {
            let shortName = localName?.name.replace("Generation ", "")
            return shortName
        }

        console.warn(
            `Message to the developer: figure out generation short names in locale '${locale}'`
        )

        return localName?.name
    }
}