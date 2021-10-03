import React from "react"
import { Form, Select } from "semantic-ui-react"

import { getDisplayNameOfLocation, getDisplayNameOfLocationArea } from "../../models/Helpers"
import { LocationInfo } from "../../models/swagger"

interface LocationAreaSelectorProps {
    location: LocationInfo | undefined
    locationAreaId: number | undefined
    setLocationAreaId: (id: number) => void
}

export const LocationAreaSelector = (props: LocationAreaSelectorProps) => {
    let locationAreas = props.location?.locationAreas ?? []
    let options = locationAreas.map(l => {
        let areaName = getDisplayNameOfLocationArea(l)
        if (areaName === "") {
            areaName = getDisplayNameOfLocation(props.location!)
        }

        return {
            key: l.id,
            text: areaName,
            value: l.id
        }
    })

    let disabled = options.length <= 1

    let selectedOption = options.find(o => o.value === props.locationAreaId)

    return (
        <Form.Field>
            <label>Area</label>

            <Select
                search
                className="version-group-select"
                value={selectedOption?.value ?? ""}
                placeholder={disabled ? "-" : "Select an area!"}
                disabled={disabled}
                onChange={(_, { value }) => props.setLocationAreaId(value as number)}
                options={options} />
        </Form.Field>
    )
}
