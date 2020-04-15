import React, { Component } from "react"
import { Collapse, Button } from "reactstrap"

import { IHasIndex } from "../CommonMembers"

import "./SpeciesFilter.scss"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

interface ISpeciesFilterProps extends IHasIndex {
    /**
     * The species to filter.
     */
    species: PokemonSpeciesEntry[]
}

interface ISpeciesFilterState {
    /**
     * Whether the generation filter is open.
     */
    generationFilterOpen: boolean

    /**
     * Whether the type filter is open.
     */
    typeFilterOpen: boolean

    /**
     * Whether the base stat filter is open.
     */
    baseStatFilterOpen: boolean
}

/**
 * Component for filtering a list of species stored in the parent component.
 */
export class SpeciesFilter extends Component<ISpeciesFilterProps, ISpeciesFilterState> {
    /**
     * Constructor.
     */
    constructor(props: ISpeciesFilterProps) {
        super(props)
        this.state = {
            generationFilterOpen: CookieHelper.getFlag(`generationFilterOpen${this.props.index}`),
            typeFilterOpen: CookieHelper.getFlag(`typeFilterOpen${this.props.index}`),
            baseStatFilterOpen: CookieHelper.getFlag(`baseStatFilterOpen${this.props.index}`)
        }
    }

    /**
     * Renders the component.
     */
    render() {
        return this.renderFilters()
    }

    /**
     * Renders the filter.
     */
    renderFilters() {
        const toggleGenerationFilter = () => this.toggleGenerationFilter()
        const toggleTypeFilter = () => this.toggleTypeFilter()
        const toggleBaseStatFilter = () => this.toggleBaseStatFilter()

        return (
            <div className="fill-parent padding">
                <div className="margin-bottom">
                    <Button
                        block
                        color="info"
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleGenerationFilter}>
                        Filter by generation
                    </Button>
                    <Collapse isOpen={this.state.generationFilterOpen}>
                        {this.renderGenerationFilter()}
                    </Collapse>
                </div>

                <div className="margin-bottom">
                    <Button
                        block
                        color="info"
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleTypeFilter}>
                        Filter by type
                    </Button>
                    <Collapse isOpen={this.state.typeFilterOpen}>
                        {this.renderTypeFilter()}
                    </Collapse>
                </div>

                <div>
                    <Button
                        block
                        color="info"
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleBaseStatFilter}>
                        Filter by base stats
                    </Button>
                    <Collapse isOpen={this.state.baseStatFilterOpen}>
                        {this.renderBaseStatFilter()}
                    </Collapse>
                </div>
            </div>
        )
    }

    /**
     * Renders the generation filter.
     */
    renderGenerationFilter() {
        return (
            <span>GenerationFilter</span>
        )
    }

    /**
     * Renders the type filter.
     */
    renderTypeFilter() {
        return (
            <span>TypeFilter</span>
        )
    }

    /**
     * Renders the base stat filter.
     */
    renderBaseStatFilter() {
        return (
            <span>BaseStatFilter</span>
        )
    }

    /**
     * Toggles the generation filter.
     */
    toggleGenerationFilter() {
        CookieHelper.set(`generationFilterOpen${this.props.index}`, !this.state.generationFilterOpen)

        this.setState(previousState => ({
            generationFilterOpen: !previousState.generationFilterOpen
        }))
    }

    /**
     * Toggles the type filter.
     */
    toggleTypeFilter() {
        CookieHelper.set(`typeFilterOpen${this.props.index}`, !this.state.typeFilterOpen)

        this.setState(previousState => ({
            typeFilterOpen: !previousState.typeFilterOpen
        }))
    }

    /**
     * Toggles the base stat filter.
     */
    toggleBaseStatFilter() {
        CookieHelper.set(`baseStatFilterOpen${this.props.index}`, !this.state.baseStatFilterOpen)

        this.setState(previousState => ({
            baseStatFilterOpen: !previousState.baseStatFilterOpen
        }))
    }
}