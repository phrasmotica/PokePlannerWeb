import { DisplayName } from "./DisplayName"
import { MoveDamageClass } from "./MoveDamageClass"
import { MoveTarget } from "./MoveTarget"
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
     * The move's base power.
     */
    power: number | undefined

    /**
     * The damage class of the move.
     */
    damageClass: MoveDamageClass

    /**
     * The move's power.
     */
    accuracy: number | undefined

    /**
     * The move's maximum number of power points.
     */
    pp: number | undefined

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
        displayNames: DisplayName[],
        type: Type,
        power: number | undefined,
        damageClass: MoveDamageClass,
        accuracy: number | undefined,
        pp: number | undefined,
        priority: number,
        target: MoveTarget
    ) {
        this.moveId = moveId
        this.name = name
        this.displayNames = displayNames
        this.type = type
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
            move.power,
            move.damageClass,
            move.accuracy,
            move.pp,
            move.priority,
            move.target
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