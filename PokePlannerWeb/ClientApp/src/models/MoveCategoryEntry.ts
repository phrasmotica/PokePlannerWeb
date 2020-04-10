import { LocalString } from "./LocalString"

/**
 * Represents a move category in the data store.
 */
export class MoveCategoryEntry {
    /**
     * The ID of the move category.
     */
    moveTargetId: number

    /**
     * The name of the move category.
     */
    name: string

    /**
     * The descriptions of the move category.
     */
    descriptions: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        moveTargetId: number,
        name: string,
        descriptions: LocalString[]
    ) {
        this.moveTargetId = moveTargetId
        this.name = name
        this.descriptions = descriptions
    }

    /**
     * Returns a move category created from the given entry.
     */
    static from(category: MoveCategoryEntry) {
        return new MoveCategoryEntry(
            category.moveTargetId,
            category.name,
            category.descriptions
        )
    }

    /**
     * Returns the move category's description in the given locale.
     */
    getDescription(locale: string): string | undefined {
        let localDesc = this.descriptions.find(n => n.language === locale)
        if (localDesc === undefined) {
            console.warn(
                `Move category ${this.moveTargetId} is missing description in locale '${locale}'`
            )
        }

        return localDesc?.value
    }
}