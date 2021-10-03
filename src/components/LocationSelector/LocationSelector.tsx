import React from "react"
import { Form, Select } from "semantic-ui-react"

import { getDisplayNameOfLocation } from "../../models/Helpers"
import { LocationInfo } from "../../models/swagger"

interface LocationSelectorProps {
    locations: LocationInfo[]
    locationId: number | undefined
    setLocationId: (id: number) => void
}

export const LocationSelector = (props: LocationSelectorProps) => {
    let options = props.locations.map(l => ({
        key: l.id,
        text: getDisplayNameOfLocation(l),
        value: l.id
    }))

    let selectedOption = options.find(o => o.value === props.locationId)

    return (
        <Form.Field>
            <label>Location</label>

            <Select
                search
                className="version-group-select"
                value={selectedOption?.value ?? ""}
                onChange={(_, { value }) => props.setLocationId(value as number)}
                options={options} />
        </Form.Field>
    )
}
