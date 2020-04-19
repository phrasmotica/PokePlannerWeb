import { EfficacyMap } from "./EfficacyMap"
import { Generation } from "./Generation"
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
    generation: Generation

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
        generation: Generation,
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

/**
 * Type info plus whether the type is present in some version group.
 */
export class VersionGroupTypeContext extends TypeEntry {
    /**
     * Whether the type is present.
     */
    isPresent: boolean

    /**
     * Constructor.
     */
    constructor(
        typeId: number,
        name: string,
        displayNames: LocalString[],
        isConcrete: boolean,
        generation: Generation,
        efficacyMap: EfficacyMap,
        isPresent: boolean
    ) {
        super(
            typeId,
            name,
            displayNames,
            isConcrete,
            generation,
            efficacyMap
        )

        this.isPresent = isPresent
    }

    /**
     * Returns a type context created from the given context.
     */
    static from(context: VersionGroupTypeContext) {
        return new VersionGroupTypeContext(
            context.typeId,
            context.name,
            context.displayNames,
            context.isConcrete,
            context.generation,
            context.efficacyMap,
            context.isPresent
        )
    }
}