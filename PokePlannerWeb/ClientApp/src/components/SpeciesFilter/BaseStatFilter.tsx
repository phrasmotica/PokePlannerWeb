import React, { Component } from "react"
import { Input, Label } from "reactstrap"

import { BaseStatFilterValues } from "./BaseStatFilterValues"

import { IHasIndex } from "../CommonMembers"

import "./BaseStatFilter.scss"

interface IBaseStatFilterProps extends IHasIndex {
    /**
     * The IDs of the types to filter.
     */
    baseStatFilter: BaseStatFilterValues

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
    setBaseStatFilterValues: (values: BaseStatFilterValues) => void
}

interface IBaseStatFilterState {

}

/**
 * Component for filtering a list of species stored in the parent component by type.
 */
export class BaseStatFilter extends Component<IBaseStatFilterProps, IBaseStatFilterState> {
    /**
     * Renders the component.
     */
    render() {
        return this.renderFilter()
    }

    /**
     * Renders the filter.
     */
    renderFilter() {
        let items = this.props.baseStatFilter.values.map((e, index) => {
            let label = this.props.baseStatLabels[index]

            let checkboxId = `activeCheckbox${index}`
            let active = e.active

            let minValue = this.props.minValues[index]
            let maxValue = this.props.maxValues[index]

            let constrainedValue = Math.min(Math.max(e.value, minValue), maxValue)

            return (
                <div className="baseStatFilter flex-center margin-bottom-small">
                    <Label
                        className="baseStatFilterLabel margin-right-small"
                        for={checkboxId}>
                        {label}
                    </Label>

                    <Input
                        id={checkboxId}
                        type="checkbox"
                        className="activeCheckbox margin-right-small"
                        onChange={_ => this.toggleFilterActive(index)}
                        checked={active} />

                    <Input
                        id={`minValueInput${index}`}
                        type="number"
                        className="baseStatFilterInput"
                        disabled={!active}

                        // + before a variable converts it to its numeric representation!
                        onChange={e => this.setFilterValue(+e.target.value, index)}

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
     * Sets the given minimum base stat value at the given index.
     */
    toggleFilterActive(index: number) {
        let filterValues = this.props.baseStatFilter
        filterValues.toggleActive(index)
        this.props.setBaseStatFilterValues(filterValues)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    setFilterValue(min: number, index: number) {
        let filterValues = this.props.baseStatFilter
        filterValues.setValue(min, index)
        this.props.setBaseStatFilterValues(filterValues)
    }
}