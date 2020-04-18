import React, { Component } from "react"
import { Button, ButtonGroup } from "reactstrap"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"

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

        // set filter values from cookies
        let cookieGenerationFilterIds = []
        for (let id of this.props.generationIds) {
            let cookieName = `generationFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieGenerationFilterIds.push(id)
            }
        }

        this.props.setGenerationFilterIds(cookieGenerationFilterIds)
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
                    size="sm"
                    key={id}
                    color={isPresent ? "success" : "secondary"}
                    onMouseUp={() => this.toggleFilterId(id)}>
                    <span title={`Filter to species from generation ${label}`}>
                        {label}
                    </span>
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

        let cookieName = `generationFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, i < 0)

        this.props.setGenerationFilterIds(filterIds)
    }
}