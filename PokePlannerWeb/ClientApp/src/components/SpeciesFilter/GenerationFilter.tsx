import React, { Component } from "react"
import { Button, ButtonGroup, Input, Label } from "reactstrap"

import { GenerationFilterModel } from "./IdFilterModel"

import { IHasIndex } from "../CommonMembers"

import { CookieHelper } from "../../util/CookieHelper"
import { CssHelper } from "../../util/CssHelper"

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
     * The generation filter.
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
        let isEnabled = CookieHelper.getFlag(`generationFilter${this.props.index}enabled`)

        let cookieGenerationIds = []
        for (let id of this.props.generationIds) {
            let cookieName = `generationFilter${this.props.index}active${id}`
            let active = CookieHelper.getFlag(cookieName)
            if (active) {
                cookieGenerationIds.push(id)
            }
        }

        this.props.setGenerationFilter(new GenerationFilterModel(isEnabled, cookieGenerationIds))
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
        let toggleId = `generationFilter${this.props.index}toggle`

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
        let items = this.props.generationIds.map((id, index) => {
            let label = this.props.generationLabels[index]

            let filter = this.props.generationFilter
            let isPresent = filter.isInFilter([id])
            let disabled = !filter.isEnabled()
            let style = CssHelper.defaultCursorIf(disabled)

            return (
                <Button
                    size="sm"
                    key={id}
                    color={isPresent ? "success" : "secondary"}
                    disabled={disabled}
                    style={style}
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
     * Toggles the filter.
     */
    toggleFilter() {
        let generationFilter = this.props.generationFilter
        let isEnabled = generationFilter.toggle()

        let cookieName = `generationFilter${this.props.index}enabled`
        CookieHelper.set(cookieName, isEnabled)

        this.props.setGenerationFilter(generationFilter)
    }

    /**
     * Toggles the given ID in the filter.
     */
    toggleFilterId(id: number) {
        let generationFilter = this.props.generationFilter
        let isActive = generationFilter.toggleId(id)

        let cookieName = `generationFilter${this.props.index}active${id}`
        CookieHelper.set(cookieName, isActive)

        this.props.setGenerationFilter(generationFilter)
    }
}