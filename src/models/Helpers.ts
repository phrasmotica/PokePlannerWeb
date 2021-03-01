import {
    ChainLinkEntry,
    EvolutionChainEntry,
    GenerationEntry,
    LocalString,
    LocalStringListWithId,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    TypeEntryListWithId
} from "./swagger"

/**
 * Returns the given resource's display name in the given locale.
 */
export const getDisplayName = (
    resource: { displayNames: LocalString[] },
    locale: string
) => {
    let localName = resource.displayNames.find(n => n.language === locale)
    return localName?.value
}

/**
 * Returns whether the resource has display names.
 */
export const hasDisplayNames = (
    resource: { displayNames: LocalString[] }
) => {
    return resource.displayNames.length > 0
}

/**
 * Returns the given resource's flavour text in the version group with the given
 * ID in the given locale.
 */
export const getFlavourText = (
    resource: { flavourTextEntries: LocalStringListWithId[] },
    versionGroupId: number,
    locale: string
) => {
    // find most recent flavour text entry
    let matchFunc = (searchId: number) => resource.flavourTextEntries.find(e => e.id === searchId)

    let searchId = versionGroupId
    let matchingEntry: LocalStringListWithId | undefined = undefined
    while (matchingEntry === undefined && searchId > 0) {
        matchingEntry = matchFunc(searchId)
        searchId--
    }

    if (matchingEntry === undefined) {
        // older version group than the earliest one with flavour text...
        // fall back to that one
        matchingEntry = resource.flavourTextEntries[0]
    }

    let localFlavourText = matchingEntry.data.find(n => n.language === locale)
    return localFlavourText?.value
}

/**
 * Returns the IDs of the species in the chain.
 */
export const getSpeciesIds = (chain: EvolutionChainEntry) => {
    return getChainLinkSpeciesIds(chain.chain)
}

/**
 * Returns the IDs of the species in the chain.
 */
export const getChainLinkSpeciesIds = (
    chain: ChainLinkEntry
): number[] => {
    if (chain.evolvesTo.length <= 0) {
        return [chain.species.pokemonSpeciesId]
    }

    let nextSpeciesIds = chain.evolvesTo.flatMap(getChainLinkSpeciesIds)
    return [chain.species.pokemonSpeciesId, ...nextSpeciesIds]
}

/**
 * Returns the generation's short display name in the given locale.
 */
export const getShortDisplayName = (
    generation: GenerationEntry,
    locale: string
) => {
    let localName = generation.displayNames.find(n => n.language === locale)
    if (localName === undefined) {
        console.warn(
            `Generation ${generation.generationId} is missing display name in locale '${locale}'`
        )
    }

    if (locale === "en") {
        let shortName = localName?.value.replace("Generation ", "")
        return shortName
    }

    console.warn(
        `Message to the developer: figure out generation short names in locale '${locale}'`
    )

    return localName?.value
}

/**
 * Returns the species' genus in the given locale.
 */
export const getGenus = (
    species: PokemonSpeciesEntry,
    locale: string
) => {
    let localName = species.genera.find(n => n.language === locale)
    if (localName === undefined) {
        // species should have genus in every locale so throw an error
        throw new Error(
            `Species ${species.pokemonSpeciesId} is missing genus in locale '${locale}'`
        )
    }

    return localName?.value
}

/**
 * Returns the resource's types in the version group with the given ID.
 */
export const getTypes = (
    resource: PokemonSpeciesEntry | PokemonEntry | PokemonFormEntry,
    versionGroupId: number
) => {
    let types = resource.types
    if (types.length <= 0) {
        throw new Error(`Resource has no type entries`)
    }

    let newestVersionGroupId = types.reduce((t1, t2) => t1.id > t2.id ? t1 : t2).id

    // find first types entry with a version group ID after the one we're looking so
    let matchFunc = (searchId: number) => types.find(e => e.id === searchId)

    let searchId = versionGroupId
    let matchingEntry: TypeEntryListWithId | undefined = undefined
    while (matchingEntry === undefined && searchId <= newestVersionGroupId) {
        matchingEntry = matchFunc(searchId)
        searchId++
    }

    if (matchingEntry === undefined) {
        throw new Error(
            `Resource has no type data for the newest version group (${newestVersionGroupId})`
        )
    }

    return matchingEntry.data
}

/**
 * Returns the Pokemon's base stats in the version group with the given ID.
 */
export const getBaseStats = (
    pokemon: PokemonSpeciesEntry | PokemonEntry,
    versionGroupId: number
) => {
    let baseStats = pokemon.baseStats.find(t => t.id === versionGroupId)
    return baseStats?.data ?? []
}

/**
 * Returns the effective types of the Pokemon given its form.
 */
export const getEffectiveTypes = (
    variety: PokemonEntry | undefined,
    form: PokemonFormEntry | undefined,
    versionGroupId: number | undefined
) => {
    if (variety === undefined) {
        return []
    }

    if (versionGroupId === undefined) {
        throw new Error("Version group ID is undefined!")
    }

    let types = getTypes(variety, versionGroupId)

    if (form !== undefined) {
        let formTypes = getTypes(form, versionGroupId)
        if (formTypes.length > 0) {
            // use form-specific types if present
            types = formTypes
        }
    }

    return types
}

/**
 * Returns whether the resource is valid in the version group with the given ID.
 */
export const isValid = (
    resource: { validity: number[] },
    versionGroupId: number
) => {
    return resource.validity.includes(versionGroupId)
}

/**
 * Returns whether the resource has validity.
 */
export const hasValidity = (
    resource: { validity: number[] }
) => {
    return resource.validity.length > 0
}

/**
 * Returns whether the Pokemon is valid given its form.
 */
export const pokemonIsValid = (
    species: PokemonSpeciesEntry,
    form: PokemonFormEntry | undefined,
    versionGroupId: number | undefined
) => {
    if (versionGroupId === undefined) {
        throw new Error("Version group ID is undefined!")
    }

    let pokemonIsValid = isValid(species, versionGroupId)
    if (form !== undefined && hasValidity(form)) {
        // can only obtain form if base species is obtainable
        pokemonIsValid = pokemonIsValid && isValid(form, versionGroupId)
    }

    return pokemonIsValid
}

/**
 * Returns the number of links in this chain.
 */
export const size = (chain: ChainLinkEntry): number => {
    if (chain.evolvesTo.length <= 0) {
        return 1
    }

    return 1 + chain.evolvesTo.map(size).reduce((x, y) => x + y)
}
