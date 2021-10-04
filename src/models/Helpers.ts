import {
    AbilityInfo,
    ChainLinkEntry,
    EncounterMethod,
    EncountersInfo,
    EvolutionChainEntry,
    FormInfo,
    GenerationInfo,
    LearnMethodInfo,
    LocalString,
    LocalStringListWithId,
    LocationAreaInfo,
    LocationInfo,
    MoveInfo,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    PokemonSpeciesInfo,
    StatInfo,
    TypeEntryListWithId,
    TypeInfo,
    VarietyInfo,
    VersionGroupInfo,
    VersionInfo
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
 * Returns the given ability's display name.
 */
export const getDisplayNameOfAbility = (ability: AbilityInfo) => {
    return ability.names[0]?.name ?? ability.name!
}

/**
 * Returns the given encounter method's display name.
 */
export const getDisplayNameOfEncounterMethod = (method: EncounterMethod) => {
    return method.names[0]?.name ?? method.name!
}

/**
 * Returns the given form's display name.
 */
export const getDisplayNameOfForm = (form: FormInfo) => {
    return form.names[0]?.name ?? form.formName!
}

/**
 * Returns the given move's display name.
 */
export const getDisplayNameOfMove = (move: MoveInfo) => {
    return move.names[0]?.name ?? move.name!
}

/**
 * Returns the given learn method's display name.
 */
export const getDisplayNameOfLearnMethod = (method: LearnMethodInfo) => {
    return method.names[0]?.name ?? method.name!
}

/**
 * Returns the given location's display name.
 */
export const getDisplayNameOfLocation = (location: LocationInfo) => {
    return location.names[0]?.name ?? location.name!
}

/**
 * Returns the given location area's display name.
 */
export const getDisplayNameOfLocationArea = (locationArea: LocationAreaInfo) => {
    return locationArea.names[0]?.name ?? locationArea.name!
}

/**
 * Returns the given species' display name.
 */
export const getDisplayNameOfSpecies = (
    species: PokemonSpeciesInfo,
) => {
    return species.names[0]?.name ?? species.name!
}

/**
 * Returns the given variety's display name.
 */
export const getDisplayNameOfVariety = (
    variety: VarietyInfo,
) => {
    return getDisplayNameOfForm(variety.forms[0])
}

export const getPokedexNumberOfSpecies = (
    species: PokemonSpeciesInfo,
    pokedexId: number,
) => {
    return species.pokedexes.find(p => p.pokedexId === pokedexId)?.pokedexNumber
}

/**
 * Returns the given stat's display name.
 */
export const getDisplayNameOfStat = (
    stat: StatInfo,
) => {
    return stat.statNamesInfo[0]?.name ?? stat.name!
}

/**
 * Returns the given type's display name.
 */
export const getDisplayNameOfType = (
    type: TypeInfo,
) => {
    return type.typeNamesInfo[0]?.name ?? type.name!
}

/**
 * Returns the given version group's display name.
 */
export const getDisplayNameOfVersionGroup = (
    versionGroup: VersionGroupInfo,
) => {
    let versionNames = versionGroup.versionInfo.map(getDisplayNameOfVersion)
    return versionNames.join("/")
}

/**
 * Returns the given version's display name.
 */
export const getDisplayNameOfVersion = (
    version: VersionInfo,
) => {
    return version.versionNamesInfo[0]?.name ?? `version${version.versionId}`
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
 * Returns the given ability's flavour text.
 */
export const getFlavourTextOfAbility = (ability: AbilityInfo) => {
    return ability.flavorTexts[0]?.flavorText
}

/**
 * Returns the given move's flavour text.
 */
export const getFlavourTextOfMove = (move: MoveInfo) => {
    return move.flavorTexts[0]?.flavorText ?? "-"
}

/**
 * Returns the given species's flavour text.
 */
export const getFlavourTextOfSpecies = (species: PokemonSpeciesInfo) => {
    return species.flavorTexts[0]?.flavorText ?? "-"
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
    generation: GenerationInfo,
    locale: string
) => {
    let localName = generation.generationNamesInfo[0]?.name

    if (locale === "en") {
        let shortName = localName?.replace("Generation ", "")
        return shortName
    }

    console.warn(
        `Message to the developer: figure out generation short names in locale '${locale}'`
    )

    return localName
}

/**
 * Returns the species' genus.
 */
export const getGenus = (species: PokemonSpeciesInfo) => {
    return species.names[0]?.genus ?? "-"
}

/**
 * Returns the resource's types in the version group with the given ID.
 */
export const getTypes = (
    resource: PokemonSpeciesEntry | PokemonEntry | PokemonFormEntry,
    versionGroup: VersionGroupInfo
) => {
    let types = resource.types
    if (types.length <= 0) {
        throw new Error(`Resource has no type entries`)
    }

    let newestVersionGroupId = types.reduce((t1, t2) => t1.id > t2.id ? t1 : t2).id

    // find first types entry with a version group ID after the one we're looking so
    let matchFunc = (searchId: number) => types.find(e => e.id === searchId)

    let searchId = versionGroup.versionGroupId
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
 * Returns the species' types in the version group with the given ID.
 */
export const getTypesOfSpecies = (
    speciesInfo: PokemonSpeciesInfo,
) => {
    let varieties = speciesInfo.varieties
    if (varieties.length <= 0) {
        return []
    }

    let types = varieties[0].types
    return types.map(t => t.typeId)
}

/**
 * Returns the Pokemon's base stats in the version group with the given ID.
 */
export const getBaseStats = (
    pokemon: PokemonSpeciesEntry | PokemonEntry,
    versionGroup: VersionGroupInfo
) => {
    let baseStats = pokemon.baseStats.find(t => t.id === versionGroup.versionGroupId)
    return baseStats?.data ?? []
}

/**
 * Returns the species' base stats in the version group with the given ID.
 */
export const getBaseStatsOfSpecies = (
    speciesInfo: PokemonSpeciesInfo,
) => {
    let varieties = speciesInfo.varieties
    if (varieties.length <= 0) {
        return []
    }

    let stats = varieties[0].stats
    return stats.map(s => s.baseValue)
}

/**
 * Returns the effective types of the Pokemon given its form.
 */
export const getEffectiveTypes = (
    variety: VarietyInfo | undefined,
    form: FormInfo | undefined,
) => {
    if (variety === undefined) {
        return []
    }

    let types = variety.types.map(t => t.typeId)

    if (form !== undefined) {
        if (form.types.length > 0) {
            // use form-specific types if present
            types = form.types.map(t => t.typeId)
        }
    }

    return types
}

/**
 * Returns whether the resource is valid in the version group with the given ID.
 */
export const isValid = (
    resource: { validity: number[] },
    versionGroup: VersionGroupInfo
) => {
    return resource.validity.includes(versionGroup.versionGroupId)
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
    versionGroup: VersionGroupInfo | undefined
) => {
    if (versionGroup === undefined) {
        throw new Error("Version group is undefined!")
    }

    let pokemonIsValid = isValid(species, versionGroup)
    if (form !== undefined && hasValidity(form)) {
        // can only obtain form if base species is obtainable
        pokemonIsValid = pokemonIsValid && isValid(form, versionGroup)
    }

    return pokemonIsValid
}

export const typeIsConcrete = (type: TypeInfo) => type.pokemonTypesAggregate!.aggregate!.count > 0

/**
 * Returns the number of links in this chain.
 */
export const size = (chain: ChainLinkEntry): number => {
    if (chain.evolvesTo.length <= 0) {
        return 1
    }

    return 1 + chain.evolvesTo.map(size).reduce((x, y) => x + y)
}

export const sortEncounters = (encounters: EncountersInfo[]) => {
    return encounters.sort((a, b) => (a.pokemonId - b.pokemonId) || (a.minLevel - b.minLevel))
}

export const groupBy = <T>(list: T[], getKey: (item: T) => string) => {
    return list.reduce(
        (previous, currentItem) => {
            const group = getKey(currentItem)
            if (!previous[group]) {
                previous[group] = []
            }

            previous[group].push(currentItem)
            return previous
        },
        {} as { [id: string] : T[] }
    )
}
