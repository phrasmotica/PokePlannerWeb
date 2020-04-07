import React, { Component } from "react"
import Select from "react-select"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { WithId } from "../../models/WithId"

import { CookieHelper } from "../../util/CookieHelper"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

interface IVarietySelectorProps extends IHasIndex, IHasVersionGroup {
    /**
     * List of varieties.
     */
    varieties: PokemonEntry[]

    /**
     * The ID of the selected variety.
     */
    varietyId: number | undefined

    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * List of objects mapping variety IDs to the variety's forms.
     */
    formsDict: WithId<PokemonFormEntry[]>[]

    /**
     * The ID of the selected form.
     */
    formId: number | undefined

    /**
     * Handler for setting the variety in the parent component.
     */
    setVariety: (variety: PokemonEntry) => void

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

interface IVarietySelectorState {

}

/**
 * Component for selecting a species variety.
 */
export class VarietySelector extends Component<IVarietySelectorProps, IVarietySelectorState> {
    /**
     * Renders the component.
     */
    render() {
        return this.renderVarietySelect()
    }

    /**
     * Renders the variety select.
     */
    renderVarietySelect() {
        let options = this.createOptions()
        let hasVarieties = options.length > 1
        let selectedOption = null

        const onChange = (option: any) => {
            let varietyId = option.value

            // set variety cookie and remove old form cookie
            CookieHelper.set(`varietyId${this.props.index}`, varietyId)
            CookieHelper.remove(`formId${this.props.index}`)

            let variety = this.getVariety(varietyId)
            this.props.setVariety(variety)

            // set first form
            let forms = this.getFormsOfVariety(varietyId)
            let form = forms[0]

            // set form cookie
            CookieHelper.set(`formId${this.props.index}`, form.formId)

            this.props.setForm(form)
        }

        // attach validity tooltip and red border if necessary
        let validityTooltip = null
        if (hasVarieties) {
            let varietyId = this.props.varietyId
            selectedOption = options.find(o => o.value === varietyId)
        }

        let placeholder = hasVarieties ? "Select a variety!" : "-"
        let customStyles = this.createSelectStyles()

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.props.loading}
                isDisabled={!hasVarieties}
                id={"varietySelect" + this.props.index}
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

    /**
     * Returns options for the variety select.
     */
    createOptions() {
        let species = this.props.species
        if (species === undefined) {
            return []
        }

        if (this.props.formId === undefined) {
            return []
        }

        let varietyId = this.props.varietyId
        if (varietyId === undefined) {
            return []
        }

        return this.props.varieties.map(variety => {
            let label = species?.getDisplayName("en")

            let forms = this.getFormsOfVariety(variety.pokemonId)
            if (forms.length > 0) {
                // non-default forms have their own name
                let form = forms[0]
                if (form.hasDisplayNames()) {
                    label = form.getDisplayName("en") ?? label
                }
            }

            return {
                label: label,
                value: variety.pokemonId
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
                border: shouldMarkInvalid && !this.varietyIsValid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    /**
     * Returns whether the variety is valid in the selected version group.
     */
    varietyIsValid() {
        if (this.props.species === undefined) {
            return true
        }

        if (this.props.formId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Variety selector ${this.props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = this.props.species.isValid(versionGroupId)

        let form = this.getSelectedForm()
        if (form !== undefined && form.hasValidity()) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && form.isValid(versionGroupId)
        }

        return pokemonIsValid
    }

    /**
     * Returns the data object for the species variety with the given ID.
     */
    getVariety(varietyId: number) {
        let allVarieties = this.props.varieties

        let variety = allVarieties.find(p => p.pokemonId === varietyId)
        if (variety === undefined) {
            throw new Error(`Variety selector ${this.props.index}: no variety found with ID ${varietyId}!`)
        }

        return variety
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

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.getFormsOfSelectedVariety()

        let form = allForms.find(f => f.formId === formId)
        if (form === undefined) {
            return undefined
        }

        return form
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfVariety(varietyId: number) {
        let formsDict = this.props.formsDict
        if (formsDict.length <= 0) {
            return []
        }

        let forms = formsDict.find(e => e.id === varietyId)
        if (forms === undefined) {
            return []
        }

        return forms.data
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfSelectedVariety() {
        let varietyId = this.props.varietyId
        if (varietyId === undefined) {
            return []
        }

        return this.getFormsOfVariety(varietyId)
    }
}