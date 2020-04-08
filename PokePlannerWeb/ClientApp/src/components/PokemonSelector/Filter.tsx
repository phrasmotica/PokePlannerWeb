import React, { Component } from "react"
import { ListGroupItem, ListGroup, Input, Label } from "reactstrap"

import "./Filter.scss"

interface IPokemonSpeciesFilterProps {
    /**
     * The index.
     */
    index: number

    /**
     * The IDs of the items to filter.
     */
    allIds: number[]

    /**
     * The IDs of the items that pass the filter.
     */
    filterIds: number[]

    /**
     * The labels of the items to filter.
     */
    filterLabels: string[]

    /**
     * Handler for setting the filter in the parent component.
     */
    setFilterIds: (filterIds: number[]) => void
}

interface IPokemonSpeciesFilterState {

}

/**
 * Component for filtering a list of Pokemon species.
 */
export class PokemonSpeciesFilter
    extends Component<IPokemonSpeciesFilterProps, IPokemonSpeciesFilterState> {
    render() {
        return this.renderFilter()
    }

    /**
 * Renders the filter.
 */
    renderFilter() {
        let items = this.props.allIds.map((id, index) => {
            let inputId = `filterCheckbox${index}`
            let isPresent = this.props.filterIds.includes(id)
            let label = this.props.filterLabels[index]

            // TODO: use a react-select multiselect

            return (
                <ListGroupItem
                    key={`filter${this.props.index}item${index}`}
                    className="filter-item">
                    <Input
                        type="checkbox"
                        id={inputId}
                        checked={isPresent}
                        onChange={() => this.toggleFilterId(id)} />
                    <Label for={inputId} check>
                        {label}
                    </Label>
                </ListGroupItem>
            )
        })

        return (
            <ListGroup>
                {items}
            </ListGroup>
        )
    }

    /**
     * Returns options for the filter.
     */
    createFilterOptions() {
        return this.props.allIds.map((id, index) => {
            return {
                label: this.props.filterLabels[index],
                value: id
            }
        })
    }

    /**
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let filterIds = this.props.filterIds
        let i = filterIds.indexOf(id)
        if (i < 0) {
            filterIds.push(id)
        }
        else {
            filterIds.splice(i, 1)
        }

        this.props.setFilterIds(filterIds)
    }
}