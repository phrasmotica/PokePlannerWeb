import React from "react"
import { Checkbox } from "semantic-ui-react"

import { EncounterFilter } from "./AreaChecker"

interface EncountersOptionsProps {
    /**
     * Sets the filter function in parent component. Uses the filter function
     * wrapped in an anonymous function so that it can be stored via useState()
     */
    setFilter: (filter: () => EncounterFilter) => void
}

export const EncountersOptions = (props: EncountersOptionsProps) => {
    const toggleHideAll = (checked: boolean) => {
        if (checked) {
            props.setFilter(() => _ => false)
        }
        else {
            props.setFilter(() => _ => true)
        }
    }

    return (
        <div>
            <Checkbox
                label="Hide all"
                onChange={(_, { checked }) => toggleHideAll(checked ?? false)} />
        </div>
    )
}
