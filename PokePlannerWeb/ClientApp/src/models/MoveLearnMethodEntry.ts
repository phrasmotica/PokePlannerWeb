import { LocalString } from "./LocalString"

/**
 * Represents a move learn method in the data store.
 */
export class MoveLearnMethodEntry {
    /**
     * The ID of the move learn method.
     */
    moveLearnMethodId: number

    /**
     * The name of the move learn method.
     */
    name: string

    /**
     * The display names of the move learn method.
     */
    displayNames: LocalString[]

    /**
     * The descriptions of the move learn method.
     */
    descriptions: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        moveLearnMethodId: number,
        name: string,
        displayNames: LocalString[],
        descriptions: LocalString[]
    ) {
        this.moveLearnMethodId = moveLearnMethodId
        this.name = name
        this.displayNames = displayNames
        this.descriptions = descriptions
    }

    /**
     * Returns a move learn method created from the given entry.
     */
    static from(method: MoveLearnMethodEntry) {
        return new MoveLearnMethodEntry(
            method.moveLearnMethodId,
            method.name,
            method.displayNames,
            method.descriptions
        )
    }

    /**
     * Returns the move learn method's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Move learn method ${this.moveLearnMethodId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }

    /**
     * Returns the move learn method's description in the given locale.
     */
    getDescription(locale: string): string | undefined {
        let localDesc = this.descriptions.find(n => n.language === locale)
        if (localDesc === undefined) {
            console.warn(
                `Move learn method ${this.moveLearnMethodId} is missing description in locale '${locale}'`
            )
        }

        return localDesc?.value
    }
}