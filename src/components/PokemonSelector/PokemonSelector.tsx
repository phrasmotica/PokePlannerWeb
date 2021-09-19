import React from "react"
import { Button } from "reactstrap"
import { TiArrowShuffle, TiDelete } from "react-icons/ti"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { FormSelector } from "./FormSelector"
import { SpeciesSelector } from "./SpeciesSelector"
import { VarietySelector } from "./VarietySelector"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getTypesOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    FormInfo,
    GenerationInfo,
    PokemonSpeciesInfo,
    VarietyInfo,
    VersionGroupInfo,
} from "../../models/swagger"

import { CssHelper } from "../../util/CssHelper"

import "../../styles/types.scss"
import "./PokemonSelector.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface PokemonSelectorProps extends IHasIndex, IHasHideTooltips {
    versionGroup: VersionGroupInfo | undefined

    speciesInfo: SpeciesInfo

    loadingSpeciesInfo: boolean

    species: PokemonSpeciesInfo | undefined

    variety: VarietyInfo | undefined

    form: FormInfo | undefined

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

    /**
     * List of generations.
     */
    generations: GenerationInfo[]

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
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: VarietyInfo | undefined) => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: FormInfo | undefined) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleSpeciesFilter: () => void
}

/**
 * Component for selecting a Pokemon.
 */
export const PokemonSelector = (props: PokemonSelectorProps) => {
    /**
     * Renders the species select box.
     */
    const renderSpeciesSelect = () => {
        return (
            <SpeciesSelector
                index={props.index}
                versionGroup={props.versionGroup}
                hideTooltips={props.hideTooltips}
                speciesInfo={props.speciesInfo}
                species={props.species}
                loading={props.loadingSpeciesInfo}
                generationFilter={props.generationFilter}
                typeFilter={props.typeFilter}
                baseStatFilter={props.baseStatFilter}
                setSpecies={props.setSpecies}
                toggleFilter={props.toggleSpeciesFilter} />
        )
    }

    /**
     * Renders the variety select box.
     */
    const renderVarietySelect = () => (
        <VarietySelector
            index={props.index}
            versionGroup={props.versionGroup}
            hideTooltips={props.hideTooltips}
            species={props.species}
            variety={props.variety}
            setVariety={props.setVariety} />
    )

    /**
     * Renders the form select box.
     */
    const renderFormSelect = () => (
        <FormSelector
            index={props.index}
            versionGroup={props.versionGroup}
            hideTooltips={props.hideTooltips}
            variety={props.variety}
            form={props.form}
            setForm={props.setForm} />
    )

    /**
     * Renders the buttons.
     */
    const renderButtons = () => {
        let randomDisabled = getFilteredSpecies().length <= 0
        let randomStyle = CssHelper.defaultCursorIf(randomDisabled)

        let species = props.species
        let speciesIsReady = species !== undefined
        let clearStyle = CssHelper.defaultCursorIf(!speciesIsReady)

        return (
            <div className="flex margin-bottom-small">
                <div className="margin-right-small">
                    <Button
                        color="warning"
                        style={randomStyle}
                        className="selector-button"
                        disabled={randomDisabled}
                        onMouseUp={() => setRandomSpecies()}>
                        <span title="Random species">
                            <TiArrowShuffle className="selector-button-icon" />
                        </span>
                    </Button>
                </div>

                <div className="margin-right-small">
                    <Button
                        color="danger"
                        style={clearStyle}
                        className="selector-button"
                        disabled={!speciesIsReady}
                        onMouseUp={() => clearPokemon()}>
                        <span title={speciesIsReady ? "Clear" : undefined}>
                            <TiDelete className="selector-button-icon" />
                        </span>
                    </Button>
                </div>
            </div>
        )
    }

    /**
     * Returns the species that match the species filter.
     */
    const getFilteredSpecies = () => props.speciesInfo.getAllSpecies().filter(isPresent)

    /**
     * Returns whether the species passes the filter.
     */
    const isPresent = (species: PokemonSpeciesInfo) => {
        // generation filter test
        let generationId = species.generationId
        let passesGenerationFilter = props.generationFilter.passesFilter([generationId])

        // type filter test
        let speciesTypes = getTypesOfSpecies(species)
        let passesTypeFilter = props.typeFilter.passesFilter(speciesTypes)

        // base stat filter test
        let speciesBaseStats = getBaseStatsOfSpecies(species)
        let passesBaseStatFilter = props.baseStatFilter.passesFilter(speciesBaseStats)

        return passesGenerationFilter && passesTypeFilter && passesBaseStatFilter
    }

    /**
     * Set this selector to a random species.
     */
    const setRandomSpecies = () => {
        let speciesList = getFilteredSpecies()

        let max = speciesList.length
        let randomIndex = randomInt(0, max)
        let species = speciesList[randomIndex]

        props.setSpecies(species)
    }

    /**
     * Returns a random integer between the min (inclusive) and the max (exclusive).
     */
    const randomInt = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min) + min)
    }

    /**
     * Empty this selector.
     */
    const clearPokemon = () => props.setSpecies(undefined)

    return (
        <div className="margin-right">
            {renderSpeciesSelect()}
            {renderVarietySelect()}
            {renderFormSelect()}
            {renderButtons()}
        </div>
    )
}
