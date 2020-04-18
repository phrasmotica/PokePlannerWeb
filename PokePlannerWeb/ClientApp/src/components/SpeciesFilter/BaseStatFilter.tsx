import React, { Component } from "react"
import { Input } from "reactstrap"

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
        // TODO: render sliders and checkboxes next to numeric inputs
        let items = this.props.baseStatFilter.values.map((e, index) => {
            let value = e.value
            let label = this.props.baseStatLabels[index]

            return (
                <div className="baseStatFilter flex-center margin-bottom-small">
                    <span className="baseStatFilterLabel margin-right-small">
                        {label}
                    </span>

                    <Input
                        id="minValueInput"
                        type="number"
                        className="baseStatFilterInput"

                        // + before a variable converts it to its numeric representation!
                        onChange={e => this.setFilterValue(+e.target.value, index)}

                        min={0}
                        value={value}
                        max={255} />
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
    setFilterValue(min: number, index: number) {
        let filterValues = this.props.baseStatFilter
        filterValues.setValue(min, index)
        this.props.setBaseStatFilterValues(filterValues)
    }
}