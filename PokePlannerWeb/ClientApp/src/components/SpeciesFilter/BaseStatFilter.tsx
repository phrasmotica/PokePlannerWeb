import React, { Component } from "react"
import { Input, Label } from "reactstrap"
import key from "weak-key"

import { BaseStatFilterModel, BaseStatFilterValue } from "./BaseStatFilterModel"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

import "./BaseStatFilter.scss"

interface IBaseStatFilterProps extends IHasIndex {
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
        return (
            <div>
                {this.renderToggle()}
                {this.renderFilter()}
            </div>
        )
    }

    /**
     * Renders the filter toggle.
     */
    renderToggle() {
        let toggleId = `baseStatFilter${this.props.index}toggle`

        return (
            <div className="flex-center margin-bottom">
                <Input
                    id={toggleId}
                    type="checkbox"
                    className="toggleCheckbox"
                    checked={this.props.baseStatFilter.isEnabled()}
                    onChange={_ => this.toggleFilter()} />

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
    renderFilter() {
        let filter = this.props.baseStatFilter

        let items = filter.values.map((e, index) => {
            let label = this.props.baseStatLabels[index]
            let disabled = !filter.isEnabled()

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
                        <span title={`Filter to species with at least ${constrainedValue} base ${label}`}>
                            {label}
                        </span>
                    </Label>

                    <Input
                        id={checkboxId}
                        type="checkbox"
                        className="activeCheckbox margin-right-small"
                        onChange={_ => this.toggleFilterActive(index)}
                        disabled={disabled}
                        checked={active} />

                    <Input
                        id={`minValueInput${index}`}
                        type="number"
                        className="baseStatFilterInput"
                        disabled={disabled || !active}

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
     * Toggles the filter.
     */
    toggleFilter() {
        let filter = this.props.baseStatFilter
        let isEnabled = filter.toggle()

        let cookieName = `baseStatFilter${this.props.index}enabled`
        CookieHelper.set(cookieName, isEnabled)

        this.props.setBaseStatFilter(filter)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    toggleFilterActive(index: number) {
        let filter = this.props.baseStatFilter

        let cookieName = `baseStatFilter${this.props.index}active${index}`
        let isActive = filter.values[index].active
        CookieHelper.set(cookieName, !isActive)

        filter.toggleActive(index)
        this.props.setBaseStatFilter(filter)
    }

    /**
     * Sets the given minimum base stat value at the given index.
     */
    setFilterValue(value: number, index: number) {
        let cookieName = `baseStatFilter${this.props.index}value${index}`
        CookieHelper.set(cookieName, value)

        let filter = this.props.baseStatFilter
        filter.setValue(value, index)
        this.props.setBaseStatFilter(filter)
    }
}