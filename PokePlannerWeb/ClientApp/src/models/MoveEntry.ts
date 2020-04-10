import { LocalString } from "./DisplayName"
import { MoveDamageClass } from "./MoveDamageClass"
import { MoveTarget } from "./MoveTarget"
import { Type } from "./Type"
import { MoveCategory } from "./MoveCategory"

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

        return localName?.name
    }
}