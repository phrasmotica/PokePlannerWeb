import React from "react"
import { Button, ButtonGroup, Input, Label } from "reactstrap"

import { GenerationFilterModel } from "./IdFilterModel"

import { IHasIndex } from "../CommonMembers"

import { CssHelper } from "../../util/CssHelper"

interface GenerationFilterProps extends IHasIndex {
    /**
     * The IDs of the generations to filter.
     */
    generationIds: number[]

    /**
     * The labels of the generations to filter.
     */
    generationLabels: string[]

    /**
     * The generation filter.
     */
    generationFilter: GenerationFilterModel

    /**
     * Handler for setting the generation filter in the parent component.
     */
    setGenerationFilter: (filter: GenerationFilterModel) => void
}

/**
 * Component for filtering a list of species stored in the parent component by generation.
 */
export const GenerationFilter = (props: GenerationFilterProps) => {
    /**
     * Renders the filter toggle.
     */
    const renderToggle = () => {
        let toggleId = `generationFilter${props.index}toggle`

        return (
            <div className="flex-center margin-bottom">
                <Input
                    id={toggleId}
                    type="checkbox"
                    className="toggleCheckbox"
                    checked={props.generationFilter.isEnabled()}
                    onChange={_ => toggleFilter()} />

                <Label
                    className="toggleLabel"
                    for={toggleId}>
                    Enable
                </Label>
            </div>
        )
    }

    /**
     * Renders the filter.
     */
    const renderFilter = () => {
        let items = props.generationIds.map((id, index) => {
            let label = props.generationLabels[index]

            let filter = props.generationFilter
            let isPresent = filter.isInFilter([id])
            let disabled = !filter.isEnabled()
            let style = CssHelper.defaultCursorIf(disabled)

            return (
                <Button
                    size="sm"
                    key={id}
                    color={isPresent ? "success" : "secondary"}
                    disabled={disabled}
                    style={style}
                    onMouseUp={() => toggleFilterId(id)}>
                    <span title={`Filter to species from generation ${label}`}>
                        {label}
                    </span>
                </Button>
            )
        })

        return (
            <ButtonGroup className="border-box" style={{ width: "100%" }}>
                {items}
            </ButtonGroup>
        )
    }

    /**
     * Toggles the filter.
     */
    const toggleFilter = () => {
        let generationFilter = props.generationFilter
        let _ = generationFilter.toggle()
        props.setGenerationFilter(generationFilter)
    }

    /**
     * Toggles the given ID in the filter.
     */
    const toggleFilterId = (id: number) => {
        let generationFilter = props.generationFilter
        let _ = generationFilter.toggleId(id)
        props.setGenerationFilter(generationFilter)
    }

    return (
        <div>
            {renderToggle()}
            {renderFilter()}
        </div>
    )
}
