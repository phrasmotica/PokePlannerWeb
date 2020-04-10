import { LocalString } from "./LocalString"

/**
 * Represents a move damage class in the data store.
 */
export class MoveDamageClassEntry {
    /**
     * The ID of the move damage class.
     */
    moveDamageClassId: number

    /**
     * The name of the move damage class.
     */
    name: string

    /**
     * The display names of the move damage class.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        moveDamageClassId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.moveDamageClassId = moveDamageClassId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns a move damage class created from the given entry.
     */
    static from(damageClass: MoveDamageClassEntry) {
        return new MoveDamageClassEntry(
            damageClass.moveDamageClassId,
            damageClass.name,
            damageClass.displayNames
        )
    }

    /**
     * Returns the move damage class' display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Move damage class ${this.moveDamageClassId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}