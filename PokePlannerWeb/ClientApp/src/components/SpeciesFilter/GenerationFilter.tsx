import React, { Component } from "react"
import { Button, ButtonGroup } from "reactstrap"

import { IHasIndex } from "../CommonMembers"

interface IGenerationFilterProps extends IHasIndex {
    /**
     * The IDs of the generations to filter.
     */
    generationIds: number[]

    /**
     * The labels of the generations to filter.
     */
    generationLabels: string[]

    /**
     * The IDs of the generations that pass the filter.
     */
    filteredGenerationIds: number[]

    /**
     * Handler for setting the generation filter in the parent component.
     */
    setGenerationFilterIds: (filterIds: number[]) => void
}

interface IGenerationFilterState {

}

/**
 * Component for filtering a list of species stored in the parent component by generation.
 */
export class GenerationFilter extends Component<IGenerationFilterProps, IGenerationFilterState> {
    /**
     * Constructor.
     */
    constructor(props: IGenerationFilterProps) {
        super(props)
        this.state = {
            filteredGenerationIds: []
        }
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
        let items = this.props.generationIds.map((id, index) => {
            let label = this.props.generationLabels[index]
            let isPresent = this.props.filteredGenerationIds.includes(id)

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
            <ButtonGroup className="border-box" style={{ width: "100%" }}>
                {items}
            </ButtonGroup>
        )
    }

    /**
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let filterIds = this.props.filteredGenerationIds
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

        this.props.setGenerationFilterIds(filterIds)
    }
}