import React, { useState } from "react"
import { Rating } from "@material-ui/lab"
import { Button } from "reactstrap"
import { TiArrowShuffle, TiDelete, TiHeartOutline, TiHeartFullOutline } from "react-icons/ti"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

import { FormSelector } from "./FormSelector"
import { SpeciesSelector } from "./SpeciesSelector"
import { VarietySelector } from "./VarietySelector"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getTypesOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    GenerationInfo,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    PokemonSpeciesInfo,
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

    species: PokemonSpeciesEntry | undefined

    variety: PokemonEntry | undefined

    varieties: PokemonEntry[]

    setVarieties: (varieties: PokemonEntry[]) => void

    form: PokemonFormEntry | undefined

    forms: PokemonFormEntry[]

    setForms: (forms: PokemonFormEntry[]) => void

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

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
    setSpecies: (species: PokemonSpeciesEntry | undefined) => void

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: PokemonEntry | undefined) => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: PokemonFormEntry | undefined) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleSpeciesFilter: () => void

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

type SpeciesRatingsDict = {
    id: number
    rating: number
}[]

/**
 * Component for selecting a Pokemon.
 */
export const PokemonSelector = (props: PokemonSelectorProps) => {
    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)
    const [speciesRatings, setSpeciesRatings] = useState<SpeciesRatingsDict>([])
    const [favouriteSpecies, setFavouriteSpecies] = useState<number[]>([])
    const [loadingRandomSpecies, setLoadingRandomSpecies] = useState(false)

    /**
     * Renders the species select box.
     */
    const renderSpeciesSelect = () => {
        let hasNoVariants = !hasSecondaryForms() && !hasSecondaryVarieties()

        return (
            <SpeciesSelector
                index={props.index}
                versionGroup={props.versionGroup}
                hideTooltips={props.hideTooltips}
                speciesInfo={props.speciesInfo}
                species={props.species}
                loading={props.loadingSpeciesInfo || loadingRandomSpecies}
                generationFilter={props.generationFilter}
                typeFilter={props.typeFilter}
                baseStatFilter={props.baseStatFilter}
                setSpecies={props.setSpecies}
                toggleFilter={props.toggleSpeciesFilter}
                shouldMarkInvalid={!props.ignoreValidity && hasNoVariants} />
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
            varieties={props.varieties}
            setVarieties={props.setVarieties}
            species={props.species}
            variety={props.variety}
            setVariety={props.setVariety}
            shouldMarkInvalid={!props.ignoreValidity && props.varieties.length >= 2} />
    )

    /**
     * Renders the form select box.
     */
    const renderFormSelect = () => (
        <FormSelector
            index={props.index}
            versionGroup={props.versionGroup}
            hideTooltips={props.hideTooltips}
            forms={props.forms}
            setForms={props.setForms}
            species={props.species}
            variety={props.variety}
            form={props.form}
            setForm={props.setForm}
            shouldMarkInvalid={!props.ignoreValidity && props.forms.length >= 2} />
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
        let faveStyle = CssHelper.defaultCursorIf(!speciesIsReady)

        let isFavourite = species !== undefined && favouriteSpecies.includes(species?.pokemonSpeciesId)

        let faveTooltip = "Add Pokemon to favourites"
        let faveIcon = <TiHeartOutline className="selector-button-icon" />
        if (speciesIsReady && isFavourite) {
            faveTooltip = "Remove Pokemon from favourites"
            faveIcon = <TiHeartFullOutline className="selector-button-icon" />
        }

        // TODO: move rating component/fave button to their own component

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

                <div className="flex-center margin-right-small">
                    <Rating
                        size="large"
                        disabled={!speciesIsReady}
                        value={getSpeciesRating()}
                        onChange={(_, newRating) => setSpeciesRating(newRating)} />
                </div>

                <div className="flex-center margin-right-small">
                    <Button
                        color="primary"
                        style={faveStyle}
                        className="selector-button"
                        disabled={!speciesIsReady}
                        onMouseUp={() => toggleFavouriteSpecies(species?.pokemonSpeciesId)}>
                        <span title={species?.pokemonSpeciesId ? faveTooltip : undefined}>
                            {faveIcon}
                        </span>
                    </Button>
                </div>
            </div>
        )
    }

    /**
     * Returns whether the species has secondary varieties.
     */
    const hasSecondaryVarieties = () => props.varieties.length >= 2

    /**
     * Returns whether the variety has secondary forms.
     */
    const hasSecondaryForms = () => props.forms.length >= 2

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
        // ignore validity since we can't guarantee a valid Pokemon
        if (!props.ignoreValidity) {
            props.toggleIgnoreValidity()
        }

        let speciesList = getFilteredSpecies()

        let max = speciesList.length
        let randomIndex = randomInt(0, max)
        let species = speciesList[randomIndex]

        setLoadingRandomSpecies(true)

        fetch(`${process.env.REACT_APP_API_URL}/species/${species.pokemonSpeciesId}`)
            .then(response => response.json())
            .then((species: PokemonSpeciesEntry) => props.setSpecies(species))
            .catch(error => console.error(error))
            .finally(() => setLoadingRandomSpecies(false))
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

    /**
     * Returns the rating of the selected species.
     */
    const getSpeciesRating = () => {
        let speciesId = props.species?.pokemonSpeciesId
        if (speciesId === undefined) {
            return null
        }

        return speciesRatings.find(r => r.id === speciesId)?.rating ?? null
    }

    /**
     * Sets a new rating for the selected species.
     */
    const setSpeciesRating = (newRating: number | null) => {
        let speciesId = props.species?.pokemonSpeciesId
        if (speciesId === undefined) {
            return
        }

        let ratings = speciesRatings
        let current = ratings.findIndex(r => r.id === speciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (current >= 0 && newRating === null) {
            // remove existing rating
            ratings.splice(current, 1)

            console.log(ratings)
            setSpeciesRatings(ratings)
        }
        else if (newRating !== null) {
            if (current >= 0) {
                // amend existing rating
                ratings[current].rating = newRating
            }
            else {
                // add new rating
                ratings.push({ id: speciesId, rating: newRating })
            }

            console.log(ratings)
            setSpeciesRatings(ratings)
        }
    }

    /**
     * Toggles the favourite status of the species with the given ID.
     */
    const toggleFavouriteSpecies = (pokemonSpeciesId: number | undefined) => {
        if (pokemonSpeciesId === undefined) {
            return
        }

        let i = favouriteSpecies.indexOf(pokemonSpeciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (i < 0) {
            favouriteSpecies.push(pokemonSpeciesId)
        }
        else {
            favouriteSpecies.splice(i, 1)
        }

        setFavouriteSpecies(favouriteSpecies)
    }

    return (
        <div className="margin-right">
            {renderSpeciesSelect()}
            {renderVarietySelect()}
            {renderFormSelect()}
            {renderButtons()}
        </div>
    )
}
