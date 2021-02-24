import { EfficacyMap } from "./EfficacyMap"
import { GenerationEntry } from "./GenerationEntry"
import { LocalString } from "./LocalString"

/**
 * Represents a type in the data store.
 */
export class TypeEntry {
    /**
     * The ID of the type.
     */
    typeId: number

    /**
     * The name of the type.
     */
    name: string

    /**
     * The display names of the type.
     */
    displayNames: LocalString[]

    /**
     * Whether the type is concrete.
     */
    isConcrete: boolean

    /**
     * The generation in which the type was introduced.
     */
    generation: GenerationEntry

    /**
     * The type's efficacy indexed by version group ID and then type ID.
     */
    efficacyMap: EfficacyMap

    /**
     * Constructor.
     */
    constructor(
        typeId: number,
        name: string,
        displayNames: LocalString[],
        isConcrete: boolean,
        generation: GenerationEntry,
        efficacyMap: EfficacyMap
    ) {
        this.typeId = typeId
        this.name = name
        this.displayNames = displayNames
        this.isConcrete = isConcrete
        this.generation = generation
        this.efficacyMap = efficacyMap
    }

    /**
     * Returns a type created from the given entry.
     */
    static from(type: TypeEntry) {
        return new TypeEntry(
            type.typeId,
            type.name,
            type.displayNames,
            type.isConcrete,
            type.generation,
            type.efficacyMap
        )
    }

    /**
     * Returns the type's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Type ${this.typeId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.value
    }
}
