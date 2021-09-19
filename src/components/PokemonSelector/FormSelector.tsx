import React from "react"
import Select from "react-select"

import { getDisplayNameOfForm } from "../../models/Helpers"

import {
    FormInfo,
    VarietyInfo,
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
     * The selected variety.
     */
    variety: VarietyInfo | undefined

    form: FormInfo | undefined

    /**
     * Handler for setting the form in the parent component.
     */
    setForm: (form: FormInfo) => void
}

/**
 * Component for selecting a Pokemon form.
 */
export const FormSelector = (props: FormSelectorProps) => {
    const getForms = () => props.variety?.forms ?? []

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
            selectedOption = options.find(o => o.value === props.form!.id) ?? null
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
        if (isDisabled()) {
            return []
        }

        return getForms().map(form => {
            let label = getDisplayNameOfForm(form)

            return {
                label: label,
                value: form.id
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
    const isDisabled = () => getForms().length <= 1

    /**
     * Handler for when the selected form changes.
     */
    const onChange = (option: any) => {
        let formId = option.value
        let form = getForm(formId)
        props.setForm(form)
    }

    /**
     * Returns the form matching the given ID.
     */
    const getForm = (id: number) => {
        let form = getForms().find(e => e.id === id)
        if (form === undefined) {
            throw new Error(`Form selector ${props.index}: no form found with ID ${id}!`)
        }

        return form
    }

    return renderFormSelect()
}
