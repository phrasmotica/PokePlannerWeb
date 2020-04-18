import React, { Component } from "react"
import { Input, Label } from "reactstrap"

import { TypeFilterModel } from "./IdFilterModel"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

import "./TypeFilter.scss"

interface ITypeFilterProps extends IHasIndex {
    /**
     * The IDs of the types to filter.
     */
    typeIds: number[]

    /**
     * The labels of the types to filter.
     */
    typeLabels: string[]

    /**
     * The type filter model.
     */
    typeFilter: TypeFilterModel

    /**
     * Handler for setting the type filter in the parent component.
     */
    setTypeFilter: (filter: TypeFilterModel) => void
}

interface ITypeFilterState {

}

/**
 * Component for filtering a list of species stored in the parent component by type.
 */
export class TypeFilter extends Component<ITypeFilterProps, ITypeFilterState> {
    /**
     * Constructor.
     */
    constructor(props: ITypeFilterProps) {
        super(props)

        // set filter from cookies
        let isEnabled = CookieHelper.getFlag(`typeFilter${this.props.index}enabled`)

        let cookieTypeIds = []
        for (let id of this.props.typeIds) {
            let cookieName = `typeFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieTypeIds.push(id)
            }
        }

        this.props.setTypeFilter(new TypeFilterModel(isEnabled, cookieTypeIds))
    }

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
        let toggleId = `typeFilter${this.props.index}toggle`

        return (
            <div className="flex-center margin-bottom">
                <Input
                    id={toggleId}
                    type="checkbox"
                    className="toggleCheckbox"
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
        let items = this.props.typeIds.map((id, index) => {
            let label = this.props.typeLabels[index]

            let filter = this.props.typeFilter
            let active = filter.isInFilter([id])
            let disabled = !filter.isEnabled()

            let headerId = `list${this.props.index}type${index}`

            let typeHeader = <img
                                id={headerId}
                                className="type-icon-small padded"
                                alt={`type${id}`}
                                src={require(`../../images/typeIcons/${id}-small.png`)} />

            let checkboxId = `typeFilter${this.props.index}checkbox${index}`

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
                            onChange={_ => this.toggleFilterId(id)}
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
    toggleFilter() {
        let typeFilter = this.props.typeFilter
        let isEnabled = typeFilter.toggle()

        let cookieName = `typeFilter${this.props.index}enabled`
        CookieHelper.set(cookieName, isEnabled)

        this.props.setTypeFilter(typeFilter)
    }

    /**
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let typeFilter = this.props.typeFilter
        let isActive = typeFilter.toggleId(id)

        let cookieName = `typeFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, isActive)

        this.props.setTypeFilter(typeFilter)
    }
}