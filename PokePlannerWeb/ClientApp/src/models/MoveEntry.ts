import { DisplayName } from "./DisplayName"
import { Type } from "./Type"

/**
 * Represents a move in the data store.
 */
export class MoveEntry {
    /**
     * The ID of the move.
     */
    moveId: number

    /**
     * The name of the move.
     */
    name: string

    /**
     * The display names of the move.
     */
    displayNames: DisplayName[]

    /**
     * The type of the move.
     */
    type: Type

    /**
     * Constructor.
     */
    constructor(
        moveId: number,
        name: string,
        displayNames: DisplayName[],
        type: Type
    ) {
        this.moveId = moveId
        this.name = name
        this.displayNames = displayNames
        this.type = type
    }

    /**
     * Returns a move created from the given entry.
     */
    static from(move: MoveEntry) {
        return new MoveEntry(
            move.moveId,
            move.name,
            move.displayNames,
            move.type
        )
    }

    /**
     * Returns the move's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Move ${this.moveId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.name
    }
}