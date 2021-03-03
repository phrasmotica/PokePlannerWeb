import React from "react"
import { Input, Label } from "reactstrap"
import key from "weak-key"

import { BaseStatFilterModel } from "./BaseStatFilterModel"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

import "./BaseStatFilter.scss"

interface BaseStatFilterProps extends IHasIndex {
    /**
     * The base stat filter.
     */
    baseStatFilter: BaseStatFilterModel

    /**
     * The labels of the base stats to filter.
     */
    baseStatLabels: string[]

    /**
     * The minimum values to allow.
     */
    minValues: number[]

    /**
     * The maximum values to allow.
     */
    maxValues: number[]

    /**
     * Handler for setting the filter in the parent component.
     */
    setBaseStatFilter: (values: BaseStatFilterModel) => void
}

/**
 * Component for filtering a list of species stored in the parent component by type.
 */
export const BaseStatFilter = (props: BaseStatFilterProps) => {
    /**
     * Renders the filter toggle.
     */
    const renderToggle = () => {
        let toggleId = `baseStatFilter${props.index}toggle`

        return (
            <div className="flex-center margin-bottom">
                <Input
                    id={toggleId}
                    type="checkbox"
                    className="toggleCheckbox"
                    checked={props.baseStatFilter.isEnabled()}
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
        let filter = props.baseStatFilter

        let items = filter.values.map((e, index) => {
            let label = props.baseStatLabels[index]
            let disabled = !filter.isEnabled()

            let checkboxId = `baseStatFilter${props.index}activeCheckbox${index}`
            let active = e.active

            let minValue = props.minValues[index]
            let maxValue = props.maxValues[index]

            let constrainedValue = Math.min(Math.max(e.value, minValue), maxValue)

            return (
                <div
                    key={key(e)}
                    className="baseStatFilter flex-center margin-bottom-small">
                    <Label
                        className="baseStatFilterLabel margin-right-small"
                        for={checkboxId}>
                        <span title={`Filter to species with at least ${constrainedValue} base ${label}`}>
                            {label}
                        </span>
                    </Label>

                    <Input
                        id={checkboxId}
                        type="checkbox"
                        className="activeCheckbox margin-right-small"
                        onChange={_ => toggleFilterActive(index)}
                        disabled={disabled}
                        checked={active} />

                    <Input
                        id={`minValueInput${index}`}
                        type="number"
                        className="baseStatFilterInput"
                        disabled={disabled || !active}

                        // + before a variable converts it to its numeric representation!
                        onChange={e => setFilterValue(+e.target.value, index)}

                        min={minValue}
                        value={constrainedValue}
                        max={maxValue} />
                </div>
            )
        })

        return (
            <div>
                {items}
            </div>
        )
    }

    /**
     * Toggles the filter.
     */
    const toggleFilter = () => {
        let filter = props.baseStatFilter
        let isEnabled = filter.toggle()

        let cookieName = `baseStatFilter${props.index}enabled`
        CookieHelper.set(cookieName, isEnabled)

        props.setBaseStatFilter(filter)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    const toggleFilterActive = (index: number) => {
        let filter = props.baseStatFilter

        let cookieName = `baseStatFilter${props.index}active${index}`
        let isActive = filter.values[index].active
        CookieHelper.set(cookieName, !isActive)

        filter.toggleActive(index)
        props.setBaseStatFilter(filter)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    const setFilterValue = (value: number, index: number) => {
        let cookieName = `baseStatFilter${props.index}value${index}`
        CookieHelper.set(cookieName, value)

        let filter = props.baseStatFilter
        filter.setValue(value, index)
        props.setBaseStatFilter(filter)
    }

    return (
        <div>
            {renderToggle()}
            {renderFilter()}
        </div>
    )
}
