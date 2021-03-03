import React, { useState } from "react"
import { Tooltip } from "reactstrap"
import Select from "react-select"

import { getDisplayName, hasDisplayNames, hasValidity, isValid } from "../../models/Helpers"

import {
    PokemonFormEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

interface FormSelectorProps {
    /**
     * The index of this component.
     */
    index: number

    /**
     * The index of the version group.
     */
    versionGroupId: number | undefined

    /**
     * List of forms to select from.
     */
    forms: PokemonFormEntry[]

    /**
     * The ID of the selected form.
     */
    formId: number | undefined

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * Whether the form should be marked as invalid.
     */
    shouldMarkInvalid: boolean

    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

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
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)

    /**
     * Renders the form select.
     */
    const renderFormSelect = () => {
        let options = createOptions()

        let selectedOption = null
        let formId = props.formId
        if (formId !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === formId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectId = "formSelect" + props.index
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
                placeholder={isDisabled() ? "-" : "Select a form!"}
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
     * Returns options for the select box.
     */
    const createOptions = () => {
        if (props.formId === undefined) {
            return []
        }

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
            let label = getDisplayName(species!, "en") ?? "-"

            if (hasDisplayNames(form)) {
                label = getDisplayName(form, "en") ?? label
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
    const isDisabled = () => props.forms.length <= 1

    /**
     * Handler for when the selected form changes.
     */
    const onChange = (option: any) => {
        let formId = option.value

        // set cookie
        CookieHelper.set(`formId${props.index}`, formId)

        let form = getForm(formId)
        props.setForm(form)
    }

    /**
     * Returns whether the form is valid in the selected version group.
     */
    const formIsValid = () => {
        let species = props.species
        if (species === undefined) {
            return true
        }

        if (props.formId === undefined) {
            return true
        }

        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Form selector ${props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = isValid(species, versionGroupId)

        let form = getSelectedForm()
        if (form !== undefined && hasValidity(form)) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && isValid(form, versionGroupId)
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

    /**
     * Returns the selected form.
     */
    const getSelectedForm = () => {
        let formId = props.formId
        if (formId === undefined) {
            throw new Error(`Form selector ${props.index}: form ID is undefined!`)
        }

        return getForm(formId)
    }

    /**
     * Returns the form matching the given ID.
     */
    const getForm = (id: number) => {
        let form = props.forms.find(e => e.pokemonFormId === id)
        if (form === undefined) {
            throw new Error(`Form selector ${props.index}: no form found with ID ${id}!`)
        }

        return form
    }

    return renderFormSelect()
}
