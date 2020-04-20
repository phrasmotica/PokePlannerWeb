import { LocalString } from "./LocalString"

/**
 * Represents a stat in the data store.
 */
export class StatEntry {
    /**
     * The stat's ID.
     */
    statId: number

    /**
     * The name of the stat.
     */
    name: string

    /**
     * The stat's display names.
     */
    displayNames: LocalString[]

    /**
     * Whether the stat is a battle-only stat.
     */
    isBattleOnly: boolean

    /**
     * Constructor.
     */
    constructor(
        statId: number,
        name: string,
        displayNames: LocalString[],
        isBattleOnly: boolean
    ) {
        this.statId = statId
        this.name = name
        this.displayNames = displayNames
        this.isBattleOnly = isBattleOnly
    }

    /**
     * Returns a stat created from the given entry.
     */
    static from(stat: StatEntry) {
        return new StatEntry(
            stat.statId,
            stat.name,
            stat.displayNames,
            stat.isBattleOnly
        )
    }

    /**
     * Returns the stat's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Stat ${this.statId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}