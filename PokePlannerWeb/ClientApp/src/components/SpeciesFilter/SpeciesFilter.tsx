import React, { Component } from "react"
import { Collapse, Button } from "reactstrap"

import { BaseStatFilter } from "./BaseStatFilter"
import { BaseStatFilterValues } from "./BaseStatFilterValues"
import { GenerationFilter } from "./GenerationFilter"
import { TypeFilter } from "./TypeFilter"
import { TypeFilterModel } from "./TypeFilterModel"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { TypeEntry } from "../../models/TypeEntry"

import { CookieHelper } from "../../util/CookieHelper"

import "./SpeciesFilter.scss"

interface ISpeciesFilterProps extends IHasIndex, IHasVersionGroup {
    /**
     * The species to filter.
     */
    species: PokemonSpeciesEntry[]

    /**
     * The generations.
     */
    generations: GenerationEntry[]

    /**
     * The species to filter.
     */
    types: TypeEntry[]

    /**
     * The base stat minimum values.
     */
    baseStatMinValues: BaseStatFilterValues

    /**
     * The base stat names.
     */
    baseStatNames: string[]

    /**
     * The IDs of the generations that pass the filter.
     */
    filteredGenerationIds: number[]

    /**
     * The IDs of the types that pass the filter.
     */
    typeFilter: TypeFilterModel

    /**
     * Handler for settings the filtered generation IDs in the parent component.
     */
    setGenerationFilterIds: (ids: number[]) => void

    /**
     * Handler for settings the filtered type IDs in the parent component.
     */
    setTypeFilter: (filter: TypeFilterModel) => void

    /**
     * Handler for settings the filtered type IDs in the parent component.
     */
    setBaseStatFilterValues: (values: BaseStatFilterValues) => void
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
            generationFilterOpen: CookieHelper.getFlag(`generationFilter${this.props.index}open`),
            typeFilterOpen: CookieHelper.getFlag(`typeFilter${this.props.index}open`),
            baseStatFilterOpen: CookieHelper.getFlag(`baseStatFilter${this.props.index}open`)
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
            <div className="fill-parent padding overflow-y">
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

                <hr className="hr" />

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

                <hr className="hr" />

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
        let species = this.props.species
        let generationIds = species.map(s => s.generation.id).distinct()

        let generations = this.props.generations
        let generationLabels = generations.filter(g => generationIds.includes(g.generationId))
                                          .map(g => g.getShortDisplayName("en") ?? "-")

        let filteredGenerationIds = this.props.filteredGenerationIds
        if (filteredGenerationIds.length <= 0) {
            filteredGenerationIds = generationIds
        }

        const setFilterIds = (filterIds: number[]) => this.props.setGenerationFilterIds(filterIds)

        return (
            <GenerationFilter
                index={this.props.index}
                generationIds={generationIds}
                generationLabels={generationLabels}
                filteredGenerationIds={filteredGenerationIds}
                setGenerationFilterIds={setFilterIds} />
        )
    }

    /**
     * Renders the type filter.
     */
    renderTypeFilter() {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species filter ${this.props.index}: version group ID is undefined!`
            )
        }

        let species = this.props.species
        let typeIds = species.flatMap(s => s.getTypes(versionGroupId!)
                             .map(t => t.id))
                             .distinct()
                             .sort((i, j) => i - j) // ascending order

        let types = this.props.types
        let typeLabels = types.filter(t => typeIds.includes(t.typeId))
                              .map(t => t.getDisplayName("en") ?? "-")

        let typeFilter = this.props.typeFilter
        if (typeFilter.isEmpty()) {
            typeFilter = new TypeFilterModel(typeIds)
        }

        const setTypeFilter = (filter: TypeFilterModel) => this.props.setTypeFilter(filter)

        return (
            <TypeFilter
                index={this.props.index}
                typeIds={typeIds}
                typeLabels={typeLabels}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter} />
        )
    }

    /**
     * Renders the base stat filter.
     */
    renderBaseStatFilter() {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species filter ${this.props.index}: version group ID is undefined!`
            )
        }

        let filter = this.props.baseStatMinValues
        let baseStatNames = this.props.baseStatNames

        let allSpeciesBaseStats = this.props.species.map(s => s.getBaseStats(versionGroupId!))

        let minValues = []
        for (let i = 0; i < baseStatNames.length; i++) {
            let baseStatsWithMin = allSpeciesBaseStats.reduce((s, t) => s[i] < t[i] ? s : t)
            let minValue = baseStatsWithMin[i]
            minValues.push(minValue)
        }

        let maxValues = []
        for (let i = 0; i < baseStatNames.length; i++) {
            let baseStatsWithMax = allSpeciesBaseStats.reduce((s, t) => s[i] > t[i] ? s : t)
            let maxValue = baseStatsWithMax[i]
            maxValues.push(maxValue)
        }

        const setFilterValues = (values: BaseStatFilterValues) => this.props.setBaseStatFilterValues(values)

        return (
            <BaseStatFilter
                index={this.props.index}
                baseStatFilter={filter}
                baseStatLabels={baseStatNames}
                minValues={minValues}
                maxValues={maxValues}
                setBaseStatFilterValues={setFilterValues} />
        )
    }

    /**
     * Toggles the generation filter.
     */
    toggleGenerationFilter() {
        CookieHelper.set(`generationFilter${this.props.index}open`, !this.state.generationFilterOpen)

        this.setState(previousState => ({
            generationFilterOpen: !previousState.generationFilterOpen
        }))
    }

    /**
     * Toggles the type filter.
     */
    toggleTypeFilter() {
        CookieHelper.set(`typeFilter${this.props.index}open`, !this.state.typeFilterOpen)

        this.setState(previousState => ({
            typeFilterOpen: !previousState.typeFilterOpen
        }))
    }

    /**
     * Toggles the base stat filter.
     */
    toggleBaseStatFilter() {
        CookieHelper.set(`baseStatFilter${this.props.index}open`, !this.state.baseStatFilterOpen)

        this.setState(previousState => ({
            baseStatFilterOpen: !previousState.baseStatFilterOpen
        }))
    }
}