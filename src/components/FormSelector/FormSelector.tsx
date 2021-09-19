import React from "react"
import { Dropdown } from "semantic-ui-react"

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

        let selectedOption = options.find(o => o.value === props.form?.id)

        let selectDisabled = isDisabled() || options.length <= 0

        let selectId = "formSelect" + props.index
        let searchBox = (
            <Dropdown
                search
                fluid
                selection
                placeholder={selectDisabled ? "-" : "Select a form!"}
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
     * Returns options for the select box.
     */
    const createOptions = () => {
        if (isDisabled()) {
            return []
        }

        return getForms().map(form => {
            let text = getDisplayNameOfForm(form)

            return {
                key: form.id,
                text: text,
                value: form.id
            }
        })
    }

    /**
     * Returns whether the select box should be disabled.
     */
    const isDisabled = () => getForms().length <= 1

    /**
     * Handler for when the selected form changes.
     */
    const onChange = (formId: number) => {
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
