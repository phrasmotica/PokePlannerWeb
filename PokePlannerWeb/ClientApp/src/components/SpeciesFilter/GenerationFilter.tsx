import React, { Component } from "react"
import { Button, ButtonGroup } from "reactstrap"

import { GenerationFilterModel } from "./IdFilterModel"

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
    generationFilter: GenerationFilterModel

    /**
     * Handler for setting the generation filter in the parent component.
     */
    setGenerationFilter: (filter: GenerationFilterModel) => void
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

        // set filter from cookies
        let cookieGenerationIds = []
        for (let id of this.props.generationIds) {
            let cookieName = `generationFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieGenerationIds.push(id)
            }
        }

        this.props.setGenerationFilter(new GenerationFilterModel(cookieGenerationIds))
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
            let isPresent = this.props.generationFilter.passesFilter([id])

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
        let generationFilter = this.props.generationFilter
        let isActive = generationFilter.toggle(id)

        let cookieName = `generationFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, isActive)

        this.props.setGenerationFilter(generationFilter)
    }
}