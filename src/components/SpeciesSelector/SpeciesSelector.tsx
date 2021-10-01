import React, { useEffect } from "react"
import { Select } from "semantic-ui-react"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getDisplayNameOfSpecies, getPokedexNumberOfSpecies, getTypesOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    PokemonSpeciesInfo,
    VersionGroupInfo,
} from "../../models/swagger"

interface SpeciesSelectorProps {
    /**
     * The index of this component.
     */
    index: number

    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * List of species to select from.
     */
    speciesInfo: SpeciesInfo

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * The selected species.
     */
    species: PokemonSpeciesInfo | undefined

    /**
     * The generation filter.
     */
    generationFilter: GenerationFilterModel

    /**
     * The type filter.
     */
    typeFilter: TypeFilterModel

    /**
     * The base stat filter.
     */
    baseStatFilter: BaseStatFilterModel

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void
}

/**
 * Component for selecting a Pokemon species.
 */
export const SpeciesSelector = (props: SpeciesSelectorProps) => {
    /**
     * Renders the species select.
     */
    const renderSpeciesSelect = () => {
        let options = createOptions()

        let selectedOption = options.find(o => o.value === props.species?.pokemonSpeciesId)

        let selectId = "speciesSelect" + props.index
        let searchBox = (
            <Select
                search
                fluid
                placeholder={isDisabled() ? "-" : "Select a species!"}
                loading={props.loading}
                disabled={isDisabled()}
                id={selectId}
                onChange={(_, { value }) => onChange(value as number)}
                value={selectedOption?.value ?? ""}
                options={options} />
        )

        return (
            <div className="flex margin-bottom-small">
                {searchBox}
            </div>
        )
    }

    /**
     * Returns options for the species select.
     */
    const createOptions = () => {
        let menuItems = []

        if (props.versionGroup === undefined) {
            return []
        }

        menuItems = props.speciesInfo.speciesInfo.map(a => {
            return a.speciesInfo.filter(isPresent).map(species => ({
                key: `pokedex${a.pokedexId}species${species.pokemonSpeciesId}`,
                text: `#${getPokedexNumberOfSpecies(species, a.pokedexId)} ${getDisplayNameOfSpecies(species)}`,
                value: species.pokemonSpeciesId
            }))
        }).flatMap(arr => arr)

        return menuItems
    }

    /**
     * Returns whether the select box should be disabled.
     */
    const isDisabled = () => props.loading || getFilteredSpecies().length <= 0

    /**
     * Handler for when the selected species changes.
     */
    const onChange = (speciesId: number) => {
        let newSpecies = props.speciesInfo.getById(speciesId)
        props.setSpecies(newSpecies)
    }

    /**
     * Returns the species that match the species filter.
     */
    const getFilteredSpecies = () => props.speciesInfo.getAllSpecies().filter(isPresent)

    /**
     * Returns whether the species passes the filter.
     */
    const isPresent = (species: PokemonSpeciesInfo) => {
        let versionGroupId = props.versionGroup?.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${props.index}: version group ID is undefined!`
            )
        }

        // generation filter test
        let generationId = species.generationId
        let passesGenerationFilter = props.generationFilter.passesFilter([generationId])

        // type filter test
        let speciesTypes = getTypesOfSpecies(species)
        let passesTypeFilter = props.typeFilter.passesFilter(speciesTypes)

        // base stat filter test
        let speciesBaseStats = getBaseStatsOfSpecies(species)
        let passesBaseStatFilter = props.baseStatFilter.passesFilter(speciesBaseStats)

        return passesGenerationFilter && passesTypeFilter && passesBaseStatFilter
    }

    return renderSpeciesSelect()
}
