import React, { useEffect, useState } from "react"
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
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Component for selecting a species variety.
 */
export const VarietySelector = (props: VarietySelectorProps) => {
    const [loadingVarieties, setLoadingVarieties] = useState(false)

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
        if (options.length <= 1) {
            options = []
        }

        let selectedOption = null
        if (props.variety !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === props.variety!.pokemonId) ?? null
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
                isLoading={loadingVarieties}
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
        let species = props.species
        if (species === undefined) {
            return []
        }

        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            return []
        }

        if (isDisabled()) {
            return []
        }

        // variety is only available if it has at least one form
        // that was introduced in this version group at the latest
        let availableVarieties = props.varieties.filter(v => {
            return v.forms.some(f => f.versionGroup.versionGroupId <= versionGroup!.versionGroupId)
        })

        return availableVarieties.map(variety => {
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
