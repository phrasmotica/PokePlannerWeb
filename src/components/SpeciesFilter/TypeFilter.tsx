import React from "react"
import { Input, Label } from "reactstrap"

import { TypeFilterModel } from "./IdFilterModel"

import { IHasIndex } from "../CommonMembers"

import "./TypeFilter.scss"

interface TypeFilterProps extends IHasIndex {
    /**
     * The IDs of the types to filter.
     */
    typeIds: number[]

    /**
     * The labels of the types to filter.
     */
    typeLabels: string[]

    /**
     * The type filter.
     */
    typeFilter: TypeFilterModel

    /**
     * Handler for setting the type filter in the parent component.
     */
    setTypeFilter: (filter: TypeFilterModel) => void
}

/**
 * Component for filtering a list of species stored in the parent component by type.
 */
export const TypeFilter = (props: TypeFilterProps) => {
    /**
     * Renders the filter toggle.
     */
    const renderToggle = () => {
        let toggleId = `typeFilter${props.index}toggle`

        return (
            <div className="flex-center margin-bottom">
                <Input
                    id={toggleId}
                    type="checkbox"
                    className="toggleCheckbox"
                    checked={props.typeFilter.isEnabled()}
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
        let items = props.typeIds.map((id, index) => {
            let label = props.typeLabels[index]

            let filter = props.typeFilter
            let active = filter.isInFilter([id])
            let disabled = !filter.isEnabled()

            let headerId = `list${props.index}type${index}`

            let typeHeader = <img
                                id={headerId}
                                className="type-icon-small padded"
                                alt={`type${id}`}
                                src={require(`../../images/typeIcons/${id}-small.png`)} />

            let checkboxId = `typeFilter${props.index}checkbox${index}`

            return (
                <div
                    key={index}
                    className="typeFilter">
                    <Label
                        className="typeFilterLabel"
                        for={checkboxId}>
                        {typeHeader}
                    </Label>

                    <span title={`Filter to ${label}-type species`}>
                        <Input
                            id={checkboxId}
                            type="checkbox"
                            className="activeCheckbox"
                            disabled={disabled}
                            onChange={_ => toggleFilterId(id)}
                            checked={active} />
                    </span>
                </div>
            )
        })

        return (
            <div className="fill-parent typeFilterContainer">
                {items}
            </div>
        )
    }

    /**
     * Toggles the filter.
     */
    const toggleFilter = () => {
        let typeFilter = props.typeFilter
        let _ = typeFilter.toggle()
        props.setTypeFilter(typeFilter)
    }

    /**
     * Toggles the given ID in the filter.
     */
    const toggleFilterId = (id: number) => {
        let typeFilter = props.typeFilter
        let _ = typeFilter.toggleId(id)
        props.setTypeFilter(typeFilter)
    }

    return (
        <div>
            {renderToggle()}
            {renderFilter()}
        </div>
    )
}
