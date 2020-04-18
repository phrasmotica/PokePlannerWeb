import { LocalString } from "./LocalString"

/**
 * Represents an ability in the data store.
 */
export class AbilityEntry {
    /**
     * The ID of the ability.
     */
    abilityId: number

    /**
     * The name of the ability.
     */
    name: string

    /**
     * The display names of the ability.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        abilityId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.abilityId = abilityId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns an ability created from the given entry.
     */
    static from(ability: AbilityEntry) {
        return new AbilityEntry(
            ability.abilityId,
            ability.name,
            ability.displayNames
        )
    }

    /**
     * Returns the ability's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Ability ${this.abilityId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}