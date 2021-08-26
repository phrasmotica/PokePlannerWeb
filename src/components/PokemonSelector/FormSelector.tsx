import React, { useEffect, useState } from "react"
import { Tooltip } from "reactstrap"
import Select from "react-select"

import { getDisplayName, hasDisplayNames, hasValidity, isValid } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
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
    species: PokemonSpeciesEntry | undefined

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
     * Whether the form should be marked as invalid.
     */
    shouldMarkInvalid: boolean

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
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)

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

        let selectedOption = null
        if (props.form !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === props.form!.pokemonFormId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectId = "formSelect" + props.index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={loadingForms}
                isDisabled={isDisabled()}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={isDisabled() ? "-" : "Select a form!"}
                onChange={onChange}
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
     * Returns options for the select box.
     */
    const createOptions = () => {
        let species = props.species
        if (species === undefined) {
            return []
        }

        if (isDisabled()) {
            return []
        }

        let forms = props.forms
        return forms.map(form => {
            // default varieties derive name from their species
            let label = getDisplayName(species!, "en") ?? species!.name

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
                border: shouldMarkInvalid && !formIsValid() ? "1px solid #dc3545" : ""
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

    /**
     * Returns whether the form is valid in the selected version group.
     */
    const formIsValid = () => {
        let species = props.species
        if (species === undefined) {
            return true
        }

        if (props.form === undefined) {
            return true
        }

        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            throw new Error(
                `Form selector ${props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = isValid(species, versionGroup)

        let form = props.form
        if (form !== undefined && hasValidity(form)) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && isValid(form, versionGroup)
        }

        return pokemonIsValid
    }

    /**
     * Renders a tooltip indicating the validity of the form.
     */
    const renderValidityTooltip = (targetId: string) => {
        let shouldRender = !props.hideTooltips
                        && props.shouldMarkInvalid
                        && !formIsValid()

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

    return renderFormSelect()
}
