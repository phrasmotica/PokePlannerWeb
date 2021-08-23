import React, { useState } from "react"
import Select from "react-select"
import { Button, Tooltip } from "reactstrap"
import { FaFilter } from "react-icons/fa"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getTypesOfSpecies, isValid } from "../../models/Helpers"

import {
    GenerationEntry,
    PokemonSpeciesEntry,
    PokemonSpeciesInfo,
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

interface SpeciesSelectorProps {
    /**
     * The index of this component.
     */
    index: number

    /**
     * The index of the version group.
     */
    versionGroupId: number | undefined

    /**
     * List of species to select from.
     */
    speciesInfo: PokemonSpeciesInfo[]

    /**
     * The ID of the selected species.
     */
    speciesId: number | undefined

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * Whether the species should be marked as invalid.
     */
    shouldMarkInvalid: boolean

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

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
        let speciesId = props.speciesId
        if (speciesId !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === speciesId) ?? null
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
        return props.speciesInfo.map(species => ({
            label: species.name,
            value: species.pokemonSpeciesId
        }))
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
                border: shouldMarkInvalid && !speciesIsValid() ? "1px solid #dc3545" : ""
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
    const isDisabled = () => getFilteredSpecies().length <= 0

    /**
     * Handler for when the selected species changes.
     */
    const onChange = (option: any) => {
        let speciesId = option.value

        // set cookie
        CookieHelper.set(`speciesId${props.index}`, speciesId)

        fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}`)
            .then(response => response.json())
            .then((species: PokemonSpeciesEntry) => props.setSpecies(species))
            .catch(error => console.error(error))
    }

    /**
     * Returns the species that match the species filter.
     */
    const getFilteredSpecies = () => props.speciesInfo.filter(isPresent)

    /**
     * Returns whether the species passes the filter.
     */
    const isPresent = (species: PokemonSpeciesInfo) => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${props.index}: version group ID is undefined!`
            )
        }

        // generation filter test
        let generationId = species.species?.generationId ?? 0
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
     * Returns whether the species is valid in the selected version group.
     */
    const speciesIsValid = () => {
        if (props.speciesId === undefined) {
            return true
        }

        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${props.index}: version group ID is undefined!`
            )
        }

        let speciesInfo = props.speciesInfo.filter(s => s.pokemonSpeciesId === props.speciesId)[0]
        return isValid(speciesInfo.species!, versionGroupId)
    }

    /**
     * Renders a tooltip indicating the validity of the species.
     */
    const renderValidityTooltip = (targetId: string) => {
        let shouldRender = !props.hideTooltips
                        && props.shouldMarkInvalid
                        && !speciesIsValid()

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
