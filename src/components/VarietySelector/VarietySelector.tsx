import React from "react"
import Select from "react-select"

import { getDisplayNameOfVariety } from "../../models/Helpers"

import {
    PokemonSpeciesInfo,
    VarietyInfo,
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
    species: PokemonSpeciesInfo | undefined

    variety: VarietyInfo | undefined

    /**
     * Handler for setting the variety in the parent component.
     */
    setVariety: (variety: VarietyInfo) => void
}

/**
 * Component for selecting a species variety.
 */
export const VarietySelector = (props: VarietySelectorProps) => {
    const getVarieties = () => props.species?.varieties ?? []

    /**
     * Renders the variety select.
     */
    const renderVarietySelect = () => {
        let options = createOptions()
        if (options.length <= 1) {
            options = []
        }

        let selectedOption = null
        if (props.variety !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === props.variety!.id) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectDisabled = isDisabled() || options.length <= 0

        let selectId = "varietySelect" + props.index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isDisabled={selectDisabled}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={selectDisabled ? "-" : "Select a variety!"}
                onChange={(option: any) => onChange(option)}
                value={selectedOption}
                options={options} />
        )

        return (
            <div className="flex margin-bottom-small">
                {searchBox}
            </div>
        )
    }

    /**
     * Returns options for the variety select.
     */
    const createOptions = () => {
        if (isDisabled()) {
            return []
        }

        return getVarieties().map(variety => {
            let label = getDisplayNameOfVariety(variety)

            return {
                label: label,
                value: variety.id
            }
        })
    }

    /**
     * Returns a custom style for the select box.
     */
    const createSelectStyles = () => ({
        container: (provided: any, state: any) => ({
            ...provided,
            minWidth: state.selectProps.width
        }),

        control: (provided: any, state: any) => ({
            ...provided,
            minWidth: state.selectProps.width,
        }),

        menu: (provided: any, state: any) => ({
            ...provided,
            minWidth: state.selectProps.width
        })
    })

    /**
     * Returns whether the select box should be disabled.
     */
    const isDisabled = () => getVarieties().length <= 1

    /**
     * Handler for when the selected variety changes.
     */
    const onChange = (option: any) => {
        let varietyId = option.value
        let variety = getVariety(varietyId)
        props.setVariety(variety)
    }

    /**
     * Returns the variety matching the given ID.
     */
    const getVariety = (id: number) => {
        let variety = getVarieties().find(e => e.id === id)
        if (variety === undefined) {
            throw new Error(`Variety selector ${props.index}: no variety found with ID ${id}!`)
        }

        return variety
    }

    return renderVarietySelect()
}
