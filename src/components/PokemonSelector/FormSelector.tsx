import React, { useEffect, useState } from "react"
import Select from "react-select"

import { getDisplayName, getDisplayNameOfSpecies, hasDisplayNames } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesInfo,
    VersionGroupInfo
} from "../../models/swagger"

interface FormSelectorProps {
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

    /**
     * The selected variety.
     */
    variety: PokemonEntry | undefined

    form: PokemonFormEntry | undefined

    /**
     * List of forms to select from.
     */
    forms: PokemonFormEntry[]

    setForms: (forms: PokemonFormEntry[]) => void

    /**
     * Handler for setting the form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Component for selecting a Pokemon form.
 */
export const FormSelector = (props: FormSelectorProps) => {
    const [loadingForms, setLoadingForms] = useState(false)

    let index = props.index
    let versionGroupId = props.versionGroup?.versionGroupId
    let variety = props.variety
    let setForms = props.setForms

    // fetch forms when variety changes
    useEffect(() => {
        if (variety !== undefined) {
            let pokemonId = variety.pokemonId

            console.log(`Variety selector ${index}: fetching forms of variety ${pokemonId}...`)

            setLoadingForms(true)

            fetch(`${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/forms/${versionGroupId}`)
                .then(response => response.json())
                .then((forms: PokemonFormEntry[]) => setForms(forms))
                .catch(error => console.error(error))
                .finally(() => setLoadingForms(false))
        }
        else {
            setForms([])
        }

        return () => {}
    }, [index, versionGroupId, variety, setForms])

    /**
     * Renders the form select.
     */
    const renderFormSelect = () => {
        let options = createOptions()
        if (options.length <= 1) {
            options = []
        }

        let selectedOption = null
        if (props.form !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === props.form!.pokemonFormId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectDisabled = isDisabled() || options.length <= 0

        let selectId = "formSelect" + props.index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={loadingForms}
                isDisabled={selectDisabled}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={selectDisabled ? "-" : "Select a form!"}
                onChange={onChange}
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
     * Returns options for the select box.
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

        // form is only available if it was introduced
        // in this version group at the latest
        let availableForms = props.forms.filter(f => f.versionGroup.versionGroupId <= versionGroup!.versionGroupId)

        return availableForms.map(form => {
            // default varieties derive name from their species
            let label = getDisplayNameOfSpecies(species!)

            if (hasDisplayNames(form)) {
                label = getDisplayName(form, "en") ?? form.name
            }

            return {
                label: label,
                value: form.pokemonFormId
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
    const isDisabled = () => loadingForms || props.forms.length <= 1

    /**
     * Handler for when the selected form changes.
     */
    const onChange = (option: any) => {
        let formId = option.value

        fetch(`${process.env.REACT_APP_API_URL}/form/${formId}`)
            .then(response => response.json())
            .then((form: PokemonFormEntry) => props.setForm(form))
            .catch(error => console.error(error))
    }

    return renderFormSelect()
}
