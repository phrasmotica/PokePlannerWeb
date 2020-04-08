import React, { Component } from "react"
import Select from "react-select"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { CookieHelper } from "../../util/CookieHelper"

interface IFormSelectorProps extends IHasIndex, IHasVersionGroup {
    /**
     * List of forms.
     */
    forms: PokemonFormEntry[]

    /**
     * The ID of the selected form.
     */
    formId: number | undefined

    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * Handler for setting the form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * Whether the variety should be marked as invalid.
     */
    shouldMarkInvalid: boolean
}

interface IFormSelectorState {

}

/**
 * Component for selecting a Pokemon form.
 */
export class FormSelector extends Component<IFormSelectorProps, IFormSelectorState> {
    /**
     * Renders the component.
     */
    render() {
        return this.renderFormSelect()
    }

    /**
     * Renders the form select.
     */
    renderFormSelect() {
        let options = this.createOptions()
        let hasForms = options.length > 1
        let selectedOption = null

        // attach validity tooltip and red border if necessary
        let idPrefix = "formSelect"
        let validityTooltip = null
        if (hasForms) {
            let formId = this.props.formId
            selectedOption = options.find(o => o.value === formId)
        }

        let placeholder = hasForms ? "Select a form!" : "-"
        let customStyles = this.createSelectStyles()
        const onChange = (option: any) => {
            let formId = option.value

            // set cookie
            CookieHelper.set(`formId${this.props.index}`, formId)

            let form = this.getForm(formId)
            this.props.setForm(form)
        }

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.props.loading}
                isDisabled={!hasForms}
                id={idPrefix + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={onChange}
                value={selectedOption}
                options={options} />
        )

        return (
            <div className="margin-bottom-small">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns options for the form select
    createOptions() {
        let species = this.props.species
        if (species === undefined) {
            return []
        }

        if (this.props.formId === undefined) {
            return []
        }

        let forms = this.props.forms
        return forms.map(form => {
            // default varieties derive name from their species
            let label = species?.getDisplayName("en")

            if (form.hasDisplayNames()) {
                label = form.getDisplayName("en") ?? label
            }

            return {
                label: label,
                value: form.formId
            }
        })
    }

    /**
     * Returns a custom style for the variety select.
     */
    createSelectStyles() {
        let shouldMarkInvalid = this.props.shouldMarkInvalid

        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                marginLeft: "auto"
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                border: shouldMarkInvalid && !this.formIsValid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    /**
     * Returns whether the form is valid in the selected version group.
     */
    formIsValid() {
        let species = this.props.species
        if (species === undefined) {
            return true
        }

        if (this.props.formId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Form selector ${this.props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = species.isValid(versionGroupId)

        let form = this.getSelectedForm()
        if (form !== undefined && form.hasValidity()) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && form.isValid(versionGroupId)
        }

        return pokemonIsValid
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.props.forms

        let form = allForms.find(f => f.formId === formId)
        if (form === undefined) {
            throw new Error(`Form selector ${this.props.index}: no form found with ID ${formId}!`)
        }

        return form
    }

    /**
     * Returns the data object for the selected Pokemon form.
     */
    getSelectedForm() {
        let selectedFormId = this.props.formId
        if (selectedFormId === undefined) {
            return undefined
        }

        return this.getForm(selectedFormId)
    }
}