import React, { Component } from "react"
import { Input, Label } from "reactstrap"

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
     * The IDs of the types that pass the filter.
     */
    filteredTypeIds: number[]

    /**
     * Handler for setting the type filter in the parent component.
     */
    setTypeFilterIds: (ids: number[]) => void
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

        // set filter values from cookies
        let cookieTypeFilterIds = []
        for (let id of this.props.typeIds) {
            let cookieName = `typeFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieTypeFilterIds.push(id)
            }
        }

        this.props.setTypeFilterIds(cookieTypeFilterIds)
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
            let active = this.props.filteredTypeIds.includes(id)

            let headerId = `list${this.props.index}type${index}`

            let typeHeader = <img
                                id={headerId}
                                className="type-icon-small padded"
                                alt={`type${id}`}
                                src={require(`../../images/typeIcons/${id}-small.png`)} />

            let checkboxId = `typeFilter${this.props.index}checkbox${index}`

            return (
                <div className="typeFilter">
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
        let filterIds = this.props.filteredTypeIds
        let i = filterIds.indexOf(id)

        if (i >= 0 && filterIds.length <= 1) {
            // can't filter out everything
            return
        }

        if (i < 0) {
            filterIds.push(id)
        }
        else {
            filterIds.splice(i, 1)
        }

        let cookieName = `typeFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, i < 0)

        this.props.setTypeFilterIds(filterIds)
    }
}