import { LocalString } from "./LocalString"
import { WithId } from "./WithId"

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
     * The flavour text entries of the ability, indexed by version group ID.
     */
    flavourTextEntries: WithId<LocalString[]>[]

    /**
     * Constructor.
     */
    constructor(
        abilityId: number,
        name: string,
        displayNames: LocalString[],
        flavourTextEntries: WithId<LocalString[]>[]
    ) {
        this.abilityId = abilityId
        this.name = name
        this.displayNames = displayNames
        this.flavourTextEntries = flavourTextEntries
    }

    /**
     * Returns an ability created from the given entry.
     */
    static from(ability: AbilityEntry) {
        return new AbilityEntry(
            ability.abilityId,
            ability.name,
            ability.displayNames,
            ability.flavourTextEntries
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

    /**
     * Returns the ability's flavour text in the version group with the given ID in the given locale.
     */
    getFlavourText(versionGroupId: number, locale: string): string | undefined {
        if (this.flavourTextEntries.length <= 0) {
            console.warn(
                `Ability ${this.abilityId} has no flavour text entries`
            )

            return undefined
        }

        // find most recent flavour text entry
        let matchFunc = (searchId: number) => this.flavourTextEntries.find(e => e.id === searchId)

        let searchId = versionGroupId
        let matchingEntry: WithId<LocalString[]> | undefined = undefined
        while (matchingEntry === undefined && searchId > 0) {
            matchingEntry = matchFunc(searchId)
            searchId--
        }

        if (matchingEntry === undefined) {
            // older version group than the earliest one with flavour text...
            // fall back to that one
            matchingEntry = this.flavourTextEntries[0]
        }

        let localFlavourText = matchingEntry!.data.find(n => n.language === locale)
        if (localFlavourText === undefined) {
            console.warn(
                `Ability ${this.abilityId} is missing flavour text in locale '${locale}'`
            )
        }

        return localFlavourText?.value
    }
}