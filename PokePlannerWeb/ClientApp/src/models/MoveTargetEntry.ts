import { DisplayName } from "./DisplayName"

/**
 * Represents a move target in the data store.
 */
export class MoveTargetEntry {
    /**
     * The ID of the move target.
     */
    moveTargetId: number

    /**
     * The name of the move target.
     */
    name: string

    /**
     * The display names of the move target.
     */
    displayNames: DisplayName[]

    /**
     * Constructor.
     */
    constructor(
        moveTargetId: number,
        name: string,
        displayNames: DisplayName[]
    ) {
        this.moveTargetId = moveTargetId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a move target created from the given entry.
     */
    static from(target: MoveTargetEntry) {
        return new MoveTargetEntry(
            target.moveTargetId,
            target.name,
            target.displayNames
        )
    }

    /**
     * Returns the move target's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Move damage class ${this.moveTargetId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.name
    }
}