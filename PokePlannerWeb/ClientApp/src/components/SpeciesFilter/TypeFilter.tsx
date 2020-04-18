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
        let cookieTypeIds = []
        for (let id of this.props.typeIds) {
            let cookieName = `typeFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieTypeIds.push(id)
            }
        }

        this.props.setTypeFilter(new TypeFilterModel(cookieTypeIds))
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
        let items = this.props.typeIds.map((id, index) => {
            let label = this.props.typeLabels[index]
            let active = this.props.typeFilter.passesFilter([id])

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
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let typeFilter = this.props.typeFilter
        let isActive = typeFilter.toggle(id)

        let cookieName = `typeFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, isActive)

        this.props.setTypeFilter(typeFilter)
    }
}