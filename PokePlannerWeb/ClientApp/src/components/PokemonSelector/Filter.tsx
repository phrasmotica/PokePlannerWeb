import React, { Component } from "react"
import { Button, ButtonGroup } from "reactstrap"

import { IHasIndex } from "../CommonMembers"

import "./Filter.scss"

interface IFilterProps extends IHasIndex {
    /**
     * The IDs of the items to filter.
     */
    allIds: number[]

    /**
     * The labels of the items to filter.
     */
    allLabels: string[]

    /**
     * The IDs of the items that pass the filter.
     */
    filteredIds: number[]

    /**
     * The placeholder text for the select box.
     */
    placeholder: string

    /**
     * Handler for setting the filter in the parent component.
     */
    setFilterIds: (filterIds: number[]) => void
}

interface IFilterState {

}

/**
 * Component for filtering a list of entries stored in the parent component.
 */
export class Filter extends Component<IFilterProps, IFilterState> {
    render() {
        return this.renderFilter()
    }

    /**
     * Renders the filter.
     */
    renderFilter() {
        let items = this.props.allIds.map((id, index) => {
            let label = this.props.allLabels[index]
            let isPresent = this.props.filteredIds.includes(id)

            return (
                <Button
                    key={id}
                    color={isPresent ? "success" : "secondary"}
                    onMouseUp={() => this.toggleFilterId(id)}>
                    {label}
                </Button>
            )
        })

        return (
            <ButtonGroup className="generation-button-group margin-right-small">
                {items}
            </ButtonGroup>
        )
    }

    /**
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let filterIds = this.props.filteredIds
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

        this.props.setFilterIds(filterIds)
    }
}