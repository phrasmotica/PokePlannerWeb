import React, { Component } from "react"
import { Input, Label } from "reactstrap"
import key from "weak-key"

import { BaseStatFilterValues, BaseStatFilterValue } from "./BaseStatFilterValues"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

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
     * Constructor.
     */
    constructor(props: IBaseStatFilterProps) {
        super(props)

        // set filter values from cookies
        let cookieFilterValues = []
        for (let i = 0; i < this.props.baseStatFilter.values.length; i++) {
            let active = CookieHelper.getFlag(`baseStatFilter${this.props.index}active${i}`)
            let value = CookieHelper.getNumber(`baseStatFilter${this.props.index}value${i}`)
            cookieFilterValues.push(new BaseStatFilterValue(active, value ?? 0))
        }

        this.props.setBaseStatFilterValues(new BaseStatFilterValues(cookieFilterValues))
    }

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

            let checkboxId = `baseStatFilter${this.props.index}activeCheckbox${index}`
            let active = e.active

            let minValue = this.props.minValues[index]
            let maxValue = this.props.maxValues[index]

            let constrainedValue = Math.min(Math.max(e.value, minValue), maxValue)

            return (
                <div
                    key={key(e)}
                    className="baseStatFilter flex-center margin-bottom-small">
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

        let cookieName = `baseStatFilter${this.props.index}active${index}`
        let isActive = filterValues.values[index].active
        CookieHelper.set(cookieName, !isActive)

        filterValues.toggleActive(index)
        this.props.setBaseStatFilterValues(filterValues)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    setFilterValue(value: number, index: number) {
        let cookieName = `baseStatFilter${this.props.index}value${index}`
        CookieHelper.set(cookieName, value)

        let filterValues = this.props.baseStatFilter
        filterValues.setValue(value, index)
        this.props.setBaseStatFilterValues(filterValues)
    }
}