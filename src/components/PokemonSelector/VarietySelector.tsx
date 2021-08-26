import React, { useEffect, useState } from "react"
import { Tooltip } from "reactstrap"
import Select from "react-select"

import { getDisplayName, hasDisplayNames, isValid } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonSpeciesEntry,
    VersionGroupInfo
} from "../../models/swagger"

interface VarietySelectorProps {
    /**
     * The index of this component.
     */
    index: number

    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * List of varieties to select from.
     */
    varieties: PokemonEntry[]

    setVarieties: (varieties: PokemonEntry[]) => void

    variety: PokemonEntry | undefined

    /**
     * Handler for setting the variety in the parent component.
     */
    setVariety: (variety: PokemonEntry) => void

    /**
     * Whether the variety should be marked as invalid.
     */
    shouldMarkInvalid: boolean

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Component for selecting a species variety.
 */
export const VarietySelector = (props: VarietySelectorProps) => {
    const [loadingVarieties, setLoadingVarieties] = useState(false)
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)

    let index = props.index
    let versionGroupId = props.versionGroup?.versionGroupId
    let species = props.species
    let setVarieties = props.setVarieties

    // fetch varieties when species changes
    useEffect(() => {
        if (species !== undefined) {
            let speciesId = species.pokemonSpeciesId

            console.log(`Variety selector ${index}: fetching varieties of species ${speciesId}...`)

            setLoadingVarieties(true)

            fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}/varieties/${versionGroupId}`)
                .then(response => response.json())
                .then((varieties: PokemonEntry[]) => setVarieties(varieties))
                .catch(error => console.error(error))
                .finally(() => setLoadingVarieties(false))
        }
        else {
            setVarieties([])
        }

        return () => {}
    }, [index, versionGroupId, species, setVarieties])

    /**
     * Renders the variety select.
     */
    const renderVarietySelect = () => {
        let options = createOptions()

        let selectedOption = null
        if (props.variety !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === props.variety!.pokemonId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectId = "varietySelect" + props.index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={loadingVarieties}
                isDisabled={isDisabled()}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={isDisabled() ? "-" : "Select a variety!"}
                onChange={(option: any) => onChange(option)}
                value={selectedOption}
                options={options} />
        )

        // attach validity tooltip if necessary
        let validityTooltip = renderValidityTooltip(selectId)

        return (
            <div className="flex margin-bottom-small">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    /**
     * Returns options for the variety select.
     */
    const createOptions = () => {
        let species = props.species
        if (species === undefined) {
            return []
        }

        if (isDisabled()) {
            return []
        }

        return props.varieties.map(variety => {
            let label = getDisplayName(species!, "en") ?? species!.name

            if (hasDisplayNames(variety)) {
                label = getDisplayName(variety, "en") ?? variety.name
            }

            return {
                label: label,
                value: variety.pokemonId
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
                border: shouldMarkInvalid && !varietyIsValid() ? "1px solid #dc3545" : ""
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
    const isDisabled = () => loadingVarieties || props.varieties.length <= 1

    /**
     * Handler for when the selected variety changes.
     */
    const onChange = (option: any) => {
        let varietyId = option.value
        let variety = getVariety(varietyId)
        props.setVariety(variety)
    }

    /**
     * Returns whether the variety is valid in the selected version group.
     */
    const varietyIsValid = () => {
        if (props.species === undefined) {
            return true
        }

        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            throw new Error(
                `Variety selector ${props.index}: version group is undefined!`
            )
        }

        return isValid(props.species, versionGroup)
    }

    /**
     * Renders a tooltip indicating the validity of the variety.
     */
    const renderValidityTooltip = (targetId: string) => {
        let shouldRender = !props.hideTooltips
                        && props.shouldMarkInvalid
                        && !varietyIsValid()

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
     * Returns the variety matching the given ID.
     */
    const getVariety = (id: number) => {
        let variety = props.varieties.find(e => e.pokemonId === id)
        if (variety === undefined) {
            throw new Error(`Variety selector ${props.index}: no variety found with ID ${id}!`)
        }

        return variety
    }

    return renderVarietySelect()
}
