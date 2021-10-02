import React from "react"
import { Form, Select } from "semantic-ui-react"

import { getDisplayNameOfVersionGroup } from "../../models/Helpers"
import { VersionGroupInfo } from "../../models/swagger"

interface VersionGroupSelectorProps {
    versionGroups: VersionGroupInfo[]
    versionGroupId: number | undefined
    setVersionGroupId: (id: number) => void
}

export const VersionGroupSelector = (props: VersionGroupSelectorProps) => {
    let options = props.versionGroups.map(vg => ({
        key: vg.versionGroupId,
        text: getDisplayNameOfVersionGroup(vg),
        value: vg.versionGroupId
    }))

    let defaultOption = options.find(o => o.value === props.versionGroupId)

    return (
        <Form className="margin-bottom">
            <Form.Field>
                <label>Game Version</label>

                <Select
                    search
                    className="version-group-select"
                    value={defaultOption?.value ?? ""}
                    onChange={(_, { value }) => props.setVersionGroupId(value as number)}
                    options={options} />
            </Form.Field>
        </Form>
    )
}
