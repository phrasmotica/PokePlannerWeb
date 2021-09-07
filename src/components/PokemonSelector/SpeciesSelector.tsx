import React, { useState } from "react"
import Select from "react-select"
import { Button, Tooltip } from "reactstrap"
import { FaFilter } from "react-icons/fa"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getDisplayNameOfSpecies, getPokedexNumberOfSpecies, getTypesOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    PokemonSpeciesEntry,
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
    species: PokemonSpeciesEntry | undefined

    /**
     * Whether the species should be marked as invalid.
     */
    shouldMarkInvalid: boolean

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
    setSpecies: (species: PokemonSpeciesEntry | undefined) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleFilter: () => void

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Component for selecting a Pokemon species.
 */
export const SpeciesSelector = (props: SpeciesSelectorProps) => {
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)

    /**
     * Renders the species select.
     */
    const renderSpeciesSelect = () => {
        let options = createOptions()

        let selectedOption = null
        let species = props.species
        if (species !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.flatMap(o => o.options).find(o => o.value === species!.pokemonSpeciesId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectId = "speciesSelect" + props.index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={props.loading}
                isDisabled={isDisabled()}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={isDisabled() ? "-" : "Select a species!"}
                onChange={(option: any) => onChange(option)}
                value={selectedOption}
                options={options} />
        )

        // attach validity tooltip if necessary
        let validityTooltip = renderValidityTooltip(selectId)

        let filterButton = renderFilterButton()

        return (
            <div className="flex margin-bottom-small">
                {searchBox}
                {validityTooltip}
                {filterButton}
            </div>
        )
    }

    /**
     * Renders the filter button.
     */
    const renderFilterButton = () => (
        <span title="Filter species">
            <Button
                color={filterOpen ? "success" : "info"}
                className="filter-button"
                onMouseUp={toggleFilter}>
                <FaFilter className="selector-button-icon" />
            </Button>
        </span>
    )

    /**
     * Returns options for the species select.
     */
    const createOptions = () => {
        if (props.versionGroup === undefined) {
            return []
        }

        return props.speciesInfo.speciesInfo.map(a => {
            let pokedexName = props.versionGroup!.versionGroupPokedexes.map(p => p.pokedex!)
                                                                       .find(p => p.pokedexId === a.pokedexId)
                                                                       ?.names[0]?.name

            return {
                label: pokedexName,
                options: a.speciesInfo.map(species => ({
                    label: `#${getPokedexNumberOfSpecies(species, a.pokedexId)} ${getDisplayNameOfSpecies(species)}`,
                    value: species.pokemonSpeciesId,
                }))
            }
        })
    }

    /**
     * Returns a custom style for the select box.
     */
    const createSelectStyles = () => {
        let shouldMarkInvalid = props.shouldMarkInvalid

        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                border: shouldMarkInvalid ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    /**
     * Returns whether the select box should be disabled.
     */
    const isDisabled = () => props.loading || getFilteredSpecies().length <= 0

    /**
     * Handler for when the selected species changes.
     */
    const onChange = (option: any) => {
        let speciesId = option.value

        fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}`)
            .then(response => response.json())
            .then((species: PokemonSpeciesEntry) => props.setSpecies(species))
            .catch(error => console.error(error))
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

    /**
     * Renders a tooltip indicating the validity of the species.
     */
    const renderValidityTooltip = (targetId: string) => {
        let shouldRender = !props.hideTooltips && props.shouldMarkInvalid

        if (shouldRender) {
            return (
                <Tooltip
                    isOpen={validityTooltipOpen}
                    toggle={() => setValidityTooltipOpen(!validityTooltipOpen)}
                    placement="bottom"
                    target={targetId}>
                    Cannot be obtained in this game version!
                </Tooltip>
            )
        }

        return null
    }

    /**
     * Toggles the species filter.
     */
    const toggleFilter = () => {
        setFilterOpen(!filterOpen)
        props.toggleFilter()
    }

    return renderSpeciesSelect()
}
