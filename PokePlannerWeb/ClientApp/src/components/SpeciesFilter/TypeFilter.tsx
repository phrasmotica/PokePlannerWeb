import React, { Component } from "react"
import { Button } from "reactstrap"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

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
        // TODO: render grid of type icons with checkboxes

        let items = this.props.typeIds.map((id, index) => {
            let label = this.props.typeLabels[index]
            let isPresent = this.props.filteredTypeIds.includes(id)

            return (
                <Button
                    size="sm"
                    key={id}
                    color={isPresent ? "success" : "secondary"}
                    onMouseUp={() => this.toggleFilterId(id)}>
                    {label}
                </Button>
            )
        })

        return (
            <div>
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