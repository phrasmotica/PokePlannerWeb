import { DisplayName } from "./DisplayName"
import { Type } from "./Type"
import { VersionGroup } from "./VersionGroup"
import { WithId } from "./WithId"

/**
 * Represents a Pokemon form in the data store.
 */
export class PokemonFormEntry {
    /**
     * The ID of the Pokemon form.
     */
    formId: number

    /**
     * The name of the Pokemon form.
     */
    name: string

    /**
     * Whether the Pokemon form is a mega evolution.
     */
    isMega: boolean

    /**
     * The display names of the Pokemon form.
     */
    displayNames: DisplayName[]

    /**
     * The version group in which the Pokemon form was introduced.
     */
    versionGroup: VersionGroup

    /**
     * The URL of the Pokemon form's front default sprite.
     */
    spriteUrl: string

    /**
     * The URL of the Pokemon form's front shiny sprite.
     */
    shinySpriteUrl: string

    /**
     * The Pokemon form's types indexed by version group ID.
    */
    types: WithId<Type[]>[]

    /**
     * The IDs of the version groups where this Pokemon form is valid.
     */
    validity: number[]

    /**
     * Constructor.
     */
    constructor(
        formId: number,
        name: string,
        isMega: boolean,
        displayNames: DisplayName[],
        versionGroup: VersionGroup,
        spriteUrl: string,
        shinySpriteUrl: string,
        types: WithId<Type[]>[],
        validity: number[]
    ) {
        this.formId = formId
        this.name = name
        this.isMega = isMega
        this.displayNames = displayNames
        this.versionGroup = versionGroup
        this.spriteUrl = spriteUrl
        this.shinySpriteUrl = shinySpriteUrl
        this.types = types
        this.validity = validity
    }

    /**
     * Returns a Pokemon form entry created from the given entry.
     */
    static from(form: PokemonFormEntry) {
        return new PokemonFormEntry(
            form.formId,
            form.name,
            form.isMega,
            form.displayNames,
            form.versionGroup,
            form.spriteUrl,
            form.shinySpriteUrl,
            form.types,
            form.validity
        )
    }

    /**
     * Returns whether the form has display names.
     */
    hasDisplayNames() {
        return this.displayNames.length > 0
    }

    /**
     * Returns the form's display name in the given locale.
     */
    getDisplayName(locale: string): string | undefined {
        let localName = this.displayNames.find(n => n.language === locale)
        if (localName === undefined) {
            console.warn(
                `Pokemon form ${this.formId} is missing display name in locale '${locale}'`
            )
        }

        return localName?.name
    }

    /**
     * Returns whether the form has types.
     */
    hasTypes() {
        return this.types.length > 0
    }

    /**
     * Returns the form's types in the version group with the given ID.
     */
    getTypes(versionGroupId: number): Type[] {
        let types = this.types.find(t => t.id === versionGroupId)
        return types?.data ?? []
    }

    /**
     * Returns whether the form is valid in the version group with the given ID.
     */
    isValid(versionGroupId: number): boolean {
        return this.validity.includes(versionGroupId)
    }
}