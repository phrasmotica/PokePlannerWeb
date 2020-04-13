import { LocalString } from "./LocalString"
import { MoveCategory } from "./MoveCategory"
import { MoveDamageClass } from "./MoveDamageClass"
import { MoveTarget } from "./MoveTarget"
import { Type } from "./Type"
import { WithId } from "./WithId"

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
    displayNames: LocalString[]

    /**
     * The flavour text entries of the move, indexed by version group ID.
     */
    flavourTextEntries: WithId<LocalString[]>[]

    /**
     * The type of the move.
     */
    type: Type

    /**
     * The category of the move.
     */
    category: MoveCategory

    /**
     * The move's base power.
     */
    power: number | null

    /**
     * The damage class of the move.
     */
    damageClass: MoveDamageClass

    /**
     * The move's power.
     */
    accuracy: number | null

    /**
     * The move's maximum number of power points.
     */
    pp: number | null

    /**
     * The move's priority.
     */
    priority: number

    /**
     * The move's target.
     */
    target: MoveTarget

    /**
     * Constructor.
     */
    constructor(
        moveId: number,
        name: string,
        displayNames: LocalString[],
        flavourTextEntries: WithId<LocalString[]>[],
        type: Type,
        category: MoveCategory,
        power: number | null,
        damageClass: MoveDamageClass,
        accuracy: number | null,
        pp: number | null,
        priority: number,
        target: MoveTarget
    ) {
        this.moveId = moveId
        this.name = name
        this.displayNames = displayNames
        this.flavourTextEntries = flavourTextEntries
        this.type = type
        this.category = category
        this.power = power
        this.damageClass = damageClass
        this.accuracy = accuracy
        this.pp = pp
        this.priority = priority
        this.target = target
    }

    /**
     * Returns a move created from the given entry.
     */
    static from(move: MoveEntry) {
        return new MoveEntry(
            move.moveId,
            move.name,
            move.displayNames,
            move.flavourTextEntries,
            move.type,
            move.category,
            move.power,
            move.damageClass,
            move.accuracy,
            move.pp,
            move.priority,
            move.target
        )
    }

    /**
     * Returns whether the move is damaging.
     */
    isDamaging(): boolean {
        let damagingCategoryIds = [
            0, // damage
            4, // damage+ailment
            6, // damage+lower
            7, // damage+raise
            8, // damage+heal
            9, // one-hit KO
        ]

        return damagingCategoryIds.includes(this.category.id)
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

        return localName?.value
    }

    /**
     * Returns the move's flavour text in the version group with the given ID in the given locale.
     */
    getFlavourText(versionGroupId: number, locale: string): string | undefined {
        if (this.flavourTextEntries.length <= 0) {
            console.warn(
                `Move ${this.moveId} has no flavour text entries`
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
                `Move ${this.moveId} is missing flavour text in locale '${locale}'`
            )
        }

        return localFlavourText?.value
    }
}