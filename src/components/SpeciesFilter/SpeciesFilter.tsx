import React, { useState } from "react"
import { Collapse, Button } from "reactstrap"

import { BaseStatFilter } from "./BaseStatFilter"
import { BaseStatFilterModel } from "./BaseStatFilterModel"
import { GenerationFilter } from "./GenerationFilter"
import { TypeFilter } from "./TypeFilter"
import { TypeFilterModel, GenerationFilterModel } from "./IdFilterModel"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { getBaseStats, getBaseStatsOfSpecies, getDisplayName, getDisplayNameOfType, getShortDisplayName, getTypes, getTypesOfSpecies } from "../../models/Helpers"

import {
    GenerationInfo,
    PokemonSpeciesInfo,
    StatEntry,
    TypeInfo
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

import "./SpeciesFilter.scss"

interface SpeciesFilterProps extends IHasIndex, IHasVersionGroup {
    /**
     * The species to filter.
     */
    species: PokemonSpeciesInfo[]

    /**
     * The generations.
     */
    generations: GenerationInfo[]

    /**
     * The types.
     */
    types: TypeInfo[]

    /**
     * The generation filter.
     */
    generationFilter: GenerationFilterModel

    /**
     * The type filter.
     */
    typeFilter: TypeFilterModel

    /**
     * The base stat filter.
     */
    baseStatFilter: BaseStatFilterModel

    /**
     * The base stats.
     */
    baseStats: StatEntry[]

    /**
     * Handler for setting the generation filter in the parent component.
     */
    setGenerationFilter: (filter: GenerationFilterModel) => void

    /**
     * Handler for setting the type filter in the parent component.
     */
    setTypeFilter: (filter: TypeFilterModel) => void

    /**
     * Handler for setting the base stat filter in the parent component.
     */
    setBaseStatFilter: (filter: BaseStatFilterModel) => void
}

/**
 * Component for filtering a list of species stored in the parent component.
 */
export const SpeciesFilter = (props: SpeciesFilterProps) => {
    const [generationFilterOpen, setGenerationFilterOpen] = useState(
        CookieHelper.getFlag(`generationFilter${props.index}open`)
    )

    const [typeFilterOpen, setTypeFilterOpen] = useState(
        CookieHelper.getFlag(`typeFilter${props.index}open`)
    )

    const [baseStatFilterOpen, setBaseStatFilterOpen] = useState(
        CookieHelper.getFlag(`baseStatFilter${props.index}open`)
    )

    /**
     * Renders the filter.
     */
    const renderFilters = () => {
        let generationFilterLabel = "Filter by generation"
        let generationFilterColour = "info"
        let generationFilter = props.generationFilter
        if (generationFilter.isEnabled() && !generationFilter.isEmpty()) {
            generationFilterLabel += ` (${generationFilter.count()})`
            generationFilterColour = "success"
        }

        let typeFilterLabel = "Filter by type"
        let typeFilterColour = "info"
        let typeFilter = props.typeFilter
        if (typeFilter.isEnabled() && !typeFilter.isEmpty()) {
            typeFilterLabel += ` (${typeFilter.count()})`
            typeFilterColour = "success"
        }

        let baseStatFilterLabel = "Filter by base stats"
        let baseStatFilterColour = "info"
        let baseStatFilter = props.baseStatFilter
        if (baseStatFilter.isEnabled() && !baseStatFilter.isEmpty()) {
            baseStatFilterLabel += ` (${baseStatFilter.count()})`
            baseStatFilterColour = "success"
        }

        return (
            <div className="fill-parent padding overflow-y">
                <div className="margin-bottom">
                    <Button
                        block
                        color={generationFilterColour}
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleGenerationFilter}>
                        {generationFilterLabel}
                    </Button>

                    <Collapse isOpen={generationFilterOpen}>
                        {renderGenerationFilter()}
                    </Collapse>
                </div>

                <hr className="hr" />

                <div className="margin-bottom">
                    <Button
                        block
                        color={typeFilterColour}
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleTypeFilter}>
                        {typeFilterLabel}
                    </Button>

                    <Collapse isOpen={typeFilterOpen}>
                        {renderTypeFilter()}
                    </Collapse>
                </div>

                <hr className="hr" />

                <div>
                    <Button
                        block
                        color={baseStatFilterColour}
                        size="sm"
                        className="margin-bottom"
                        onClick={toggleBaseStatFilter}>
                        {baseStatFilterLabel}
                    </Button>

                    <Collapse isOpen={baseStatFilterOpen}>
                        {renderBaseStatFilter()}
                    </Collapse>
                </div>
            </div>
        )
    }

    /**
     * Renders the generation filter.
     */
    const renderGenerationFilter = () => {
        let species = props.species
        let generationIds = species.map(s => s.species!.generationId).distinct()

        let generations = props.generations
        let generationLabels = generations.filter(g => generationIds.includes(g.generationId))
                                          .map(g => getShortDisplayName(g, "en") ?? g.name!)

        let generationFilter = props.generationFilter
        if (generationFilter.isEmpty()) {
            generationFilter.ids = generationIds
        }

        const setFilter = (filter: GenerationFilterModel) => props.setGenerationFilter(filter)

        return (
            <GenerationFilter
                index={props.index}
                generationIds={generationIds}
                generationLabels={generationLabels}
                generationFilter={generationFilter}
                setGenerationFilter={setFilter} />
        )
    }

    /**
     * Renders the type filter.
     */
    const renderTypeFilter = () => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species filter ${props.index}: version group ID is undefined!`
            )
        }

        let species = props.species
        let typeIds = species.flatMap(getTypesOfSpecies)
                             .distinct()
                             .sort((i, j) => i - j) // ascending order

        let types = props.types
        let typeLabels = types.filter(t => typeIds.includes(t.typeId))
                              .map(getDisplayNameOfType)

        let typeFilter = props.typeFilter
        if (typeFilter.isEmpty()) {
            typeFilter.ids = typeIds
        }

        const setTypeFilter = (filter: TypeFilterModel) => props.setTypeFilter(filter)

        return (
            <TypeFilter
                index={props.index}
                typeIds={typeIds}
                typeLabels={typeLabels}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter} />
        )
    }

    /**
     * Renders the base stat filter.
     */
    const renderBaseStatFilter = () => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species filter ${props.index}: version group ID is undefined!`
            )
        }

        let filter = props.baseStatFilter
        let baseStats = props.baseStats

        let allSpeciesBaseStats = props.species.map(getBaseStatsOfSpecies)

        let minValues = []
        for (let i = 0; i < baseStats.length; i++) {
            let baseStatsWithMin = allSpeciesBaseStats.reduce((s, t) => s[i] < t[i] ? s : t)
            let minValue = baseStatsWithMin[i]
            minValues.push(minValue)
        }

        let maxValues = []
        for (let i = 0; i < baseStats.length; i++) {
            let baseStatsWithMax = allSpeciesBaseStats.reduce((s, t) => s[i] > t[i] ? s : t)
            let maxValue = baseStatsWithMax[i]
            maxValues.push(maxValue)
        }

        const setFilter = (values: BaseStatFilterModel) => props.setBaseStatFilter(values)

        return (
            <BaseStatFilter
                index={props.index}
                baseStatFilter={filter}
                baseStatLabels={baseStats.map(s => getDisplayName(s, "en") ?? s.name)}
                minValues={minValues}
                maxValues={maxValues}
                setBaseStatFilter={setFilter} />
        )
    }

    /**
     * Toggles the generation filter.
     */
    const toggleGenerationFilter = () => {
        CookieHelper.set(`generationFilter${props.index}open`, !generationFilterOpen)
        setGenerationFilterOpen(!generationFilterOpen)
    }

    /**
     * Toggles the type filter.
     */
    const toggleTypeFilter = () => {
        CookieHelper.set(`typeFilter${props.index}open`, !typeFilterOpen)
        setTypeFilterOpen(!typeFilterOpen)
    }

    /**
     * Toggles the base stat filter.
     */
    const toggleBaseStatFilter = () => {
        CookieHelper.set(`baseStatFilter${props.index}open`, !baseStatFilterOpen)
        setBaseStatFilterOpen(!baseStatFilterOpen)
    }

    return renderFilters()
}
