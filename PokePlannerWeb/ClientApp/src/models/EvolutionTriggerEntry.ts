import { LocalString } from "./LocalString"

/**
 * Represents an evolution trigger in the data store.
 */
export class EvolutionTriggerEntry {
    /**
     * The ID of the evolution trigger.
     */
    evolutionTriggerId: number

    /**
     * The name of the evolution trigger.
     */
    name: string

    /**
     * The display names of the evolution trigger.
     */
    displayNames: LocalString[]

    /**
     * Constructor.
     */
    constructor(
        evolutionTriggerId: number,
        name: string,
        displayNames: LocalString[]
    ) {
        this.evolutionTriggerId = evolutionTriggerId
        this.name = name
        this.displayNames = displayNames
    }

    /**
     * Returns an evolution trigger created from the given entry.
     */
    static from(evolutionTrigger: EvolutionTriggerEntry) {
        return new EvolutionTriggerEntry(
            evolutionTrigger.evolutionTriggerId,
            evolutionTrigger.name,
            evolutionTrigger.displayNames
        )
    }

    /**
     * Returns the evolution trigger's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Evolution trigger ${this.evolutionTriggerId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}