import React, { useState } from "react"
import { Tooltip } from "reactstrap"
import Select from "react-select"

import { FormsDict } from "../../models/FormsDict"
import { getDisplayName, hasDisplayNames, hasValidity, isValid } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

interface VarietySelectorProps {
    /**
     * The index of this component.
     */
    index: number

    /**
     * The index of the version group.
     */
    versionGroupId: number | undefined

    /**
     * List of varieties to select from.
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
    formsDict: FormsDict

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

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Component for selecting a species variety.
 */
export const VarietySelector = (props: VarietySelectorProps) => {
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)

    /**
     * Renders the variety select.
     */
    const renderVarietySelect = () => {
        let options = createOptions()

        let selectedOption = null
        let varietyId = props.varietyId
        if (varietyId !== undefined) {
            // undefined doesn't clear stored state so coalesce to null
            // https://github.com/JedWatson/react-select/issues/3066
            selectedOption = options.find(o => o.value === varietyId) ?? null
        }

        // attach red border if necessary
        let customStyles = createSelectStyles()

        let selectId = "varietySelect" + props.index
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

        if (props.formId === undefined) {
            return []
        }

        let varietyId = props.varietyId
        if (varietyId === undefined) {
            return []
        }

        if (isDisabled()) {
            return []
        }

        return props.varieties.map(variety => {
            let label = getDisplayName(species!, "en") ?? "-"

            if (hasDisplayNames(variety)) {
                label = getDisplayName(variety, "en") ?? label
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
    const isDisabled = () => props.varieties.length <= 1

    /**
     * Handler for when the selected variety changes.
     */
    const onChange = (option: any) => {
        let varietyId = option.value

        // set variety cookie and remove old form cookie
        CookieHelper.set(`varietyId${props.index}`, varietyId)
        CookieHelper.remove(`formId${props.index}`)

        let variety = getVariety(varietyId)
        props.setVariety(variety)

        // set first form
        let forms = getFormsOfVariety(varietyId)
        let form = forms[0]

        // set form cookie
        CookieHelper.set(`formId${props.index}`, form.pokemonFormId)

        props.setForm(form)
    }

    /**
     * Returns whether the variety is valid in the selected version group.
     */
    const varietyIsValid = () => {
        if (props.species === undefined) {
            return true
        }

        if (props.formId === undefined) {
            return true
        }

        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Variety selector ${props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = isValid(props.species, versionGroupId)

        let form = getSelectedForm()
        if (form !== undefined && hasValidity(form)) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && isValid(form, versionGroupId)
        }

        return pokemonIsValid
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

    /**
     * Returns the data object for the selected Pokemon form.
     */
    const getSelectedForm = () => {
        let selectedFormId = props.formId
        if (selectedFormId === undefined) {
            return undefined
        }

        return getForm(selectedFormId)
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    const getForm = (formId: number) => {
        let allForms = getFormsOfSelectedVariety()

        let form = allForms.find(f => f.pokemonFormId === formId)
        if (form === undefined) {
            return undefined
        }

        return form
    }

    /**
     * Returns the forms of the selected variety.
     */
    const getFormsOfVariety = (varietyId: number) => {
        // TODO: remove formsDict and formId from this component's props
        let formsDict = props.formsDict
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
    const getFormsOfSelectedVariety = () => {
        let varietyId = props.varietyId
        if (varietyId === undefined) {
            return []
        }

        return getFormsOfVariety(varietyId)
    }

    return renderVarietySelect()
}
