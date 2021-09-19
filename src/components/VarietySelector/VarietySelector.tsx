import React from "react"
import { Dropdown } from "semantic-ui-react"

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

        let selectedOption = options.find(o => o.value === props.variety?.id)

        let selectDisabled = isDisabled() || options.length <= 0

        let selectId = "varietySelect" + props.index
        let searchBox = (
            <Dropdown
                search
                fluid
                selection
                placeholder={selectDisabled ? "-" : "Select a variety!"}
                disabled={selectDisabled}
                id={selectId}
                onChange={(_, { value }) => onChange(value as number)}
                value={selectedOption?.value}
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
            let text = "Default"

            let varietyName = getDisplayNameOfVariety(variety)
            if (varietyName !== "") {
                text = varietyName
            }

            return {
                key: variety.id,
                text: text,
                value: variety.id
            }
        })
    }

    /**
     * Returns whether the select box should be disabled.
     */
    const isDisabled = () => getVarieties().length <= 1

    /**
     * Handler for when the selected variety changes.
     */
    const onChange = (varietyId: number) => {
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
