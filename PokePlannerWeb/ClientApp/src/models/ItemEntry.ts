import { LocalString } from "./LocalString"

/**
 * Represents an item in the data store.
 */
export class ItemEntry {
    /**
     * The ID of the item.
     */
    itemId: number

    /**
     * The name of the item.
     */
    name: string

    /**
     * The display names of the item.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        itemId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.itemId = itemId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns an item created from the given entry.
     */
    static from(item: ItemEntry) {
        return new ItemEntry(
            item.itemId,
            item.name,
            item.displayNames
        )
    }

    /**
     * Returns the item's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Item ${this.itemId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}