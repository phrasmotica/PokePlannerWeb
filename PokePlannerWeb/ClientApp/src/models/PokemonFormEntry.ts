import { LocalString } from "./LocalString"
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
    displayNames: LocalString[]

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
        displayNames: LocalString[],
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

        return localName?.value
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
        let types = this.types
        if (types.length <= 0) {
            // defer to Pokemon's types
            return []
        }

        let newestVersionGroupId = types.reduce((t1, t2) => t1.id > t2.id ? t1 : t2).id

        // find first types entry with a version group ID after the one we're looking so
        let matchFunc = (searchId: number) => types.find(e => e.id === searchId)

        let searchId = versionGroupId
        let matchingEntry: WithId<Type[]> | undefined = undefined
        while (matchingEntry === undefined && searchId <= newestVersionGroupId) {
            matchingEntry = matchFunc(searchId)
            searchId++
        }

        if (matchingEntry === undefined) {
            // defer to Pokemon's types
            return []
        }

        return matchingEntry.data
    }

    /**
     * Returns whether the form has validity.
     */
    hasValidity() {
        return this.validity.length > 0
    }

    /**
     * Returns whether the form is valid in the version group with the given ID.
     */
    isValid(versionGroupId: number): boolean {
        return this.validity.includes(versionGroupId)
    }
}