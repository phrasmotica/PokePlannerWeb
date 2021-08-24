import React, { useEffect, useState } from "react"
import { Rating } from "@material-ui/lab"
import { Button } from "reactstrap"
import { TiArrowShuffle, TiDelete, TiHeartOutline, TiHeartFullOutline } from "react-icons/ti"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

import { FormSelector } from "./FormSelector"
import { SpeciesSelector } from "./SpeciesSelector"
import { VarietySelector } from "./VarietySelector"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { FormsDict } from "../../models/FormsDict"
import { getBaseStats, getBaseStatsOfSpecies, getTypes, getTypesOfSpecies } from "../../models/Helpers"

import {
    GenerationInfo,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    PokemonSpeciesInfo,
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"
import { CssHelper } from "../../util/CssHelper"

import "../../styles/types.scss"
import "./PokemonSelector.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface PokemonSelectorProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    speciesInfo: PokemonSpeciesInfo[]

    species: PokemonSpeciesEntry | undefined

    variety: PokemonEntry | undefined

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
    // TODO: make PokedexPanel hold all of the state for the currently selected
    // species/variety/form
    const [varietyId, setVarietyId] = useState<number>()
    const [formId, setFormId] = useState<number>()

    const [varieties, setVarieties] = useState<PokemonEntry[]>([])
    const [loadingVarieties, setLoadingVarieties] = useState(false)

    const [formsDict, setFormsDict] = useState<FormsDict>([])
    const [loadingForms, setLoadingForms] = useState(false)

    const [validityTooltipOpen, setValidityTooltipOpen] = useState(false)
    const [speciesRatings, setSpeciesRatings] = useState<SpeciesRatingsDict>([])
    const [favouriteSpecies, setFavouriteSpecies] = useState<number[]>([])

    console.log("PokemonSelector RENDER")

    // set species from cookie on mount
    useEffect(() => {
        let index = props.index

        let speciesId = CookieHelper.getNumber(`speciesId${index}`)
        if (speciesId !== undefined) {
            let speciesIds = props.speciesInfo.map(s => s.pokemonSpeciesId)
            if (speciesIds.includes(speciesId)) {
                // cascades to set variety and form
                let species = getSpecies(speciesId)
                setSpecies(species)
            }
            else {
                // remove cookies for species that isn't available
                CookieHelper.remove(`speciesId${index}`)
                CookieHelper.remove(`varietyId${index}`)
                CookieHelper.remove(`formId${index}`)
            }
        }
    }, [])

    // set species from props if necessary
    useEffect(() => {
        let defaultSpeciesId = props.defaultSpeciesId
        let speciesIds = props.speciesInfo.map(s => s.pokemonSpeciesId)
        if (defaultSpeciesId !== undefined && speciesIds.includes(defaultSpeciesId)) {
            let species = getSpecies(defaultSpeciesId)
            setSpecies(species)

            // set cookie
            CookieHelper.set(`speciesId${props.index}`, defaultSpeciesId)
        }
        else {
            // remove cookies for species that isn't available
            setSpecies(undefined)

            let index = props.index
            CookieHelper.remove(`speciesId${index}`)
            CookieHelper.remove(`varietyId${index}`)
            CookieHelper.remove(`formId${index}`)
        }
    }, [props.defaultSpeciesId])

    /**
     * Renders the species select box.
     */
    const renderSpeciesSelect = () => {
        let hasNoVariants = !hasSecondaryForms() && !hasSecondaryVarieties()

        return (
            <SpeciesSelector
                index={props.index}
                versionGroupId={props.versionGroupId}
                hideTooltips={props.hideTooltips}
                speciesInfo={props.speciesInfo}
                speciesId={props.speciesId}
                loading={false}
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
    const renderVarietySelect = () => {
        let species = undefined
        if (props.speciesId !== undefined) {
            species = getSelectedSpecies()
        }

        return (
            <VarietySelector
                index={props.index}
                versionGroupId={props.versionGroupId}
                hideTooltips={props.hideTooltips}
                varieties={varieties}
                varietyId={varietyId}
                species={props.species}
                formsDict={formsDict}
                formId={formId}
                setVariety={setVariety}
                setForm={setForm}
                loading={loadingVarieties}
                shouldMarkInvalid={!props.ignoreValidity && varieties.length >= 2} />
        )
    }

    /**
     * Renders the form select box.
     */
    const renderFormSelect = () => {
        let species = undefined
        if (props.speciesId !== undefined) {
            species = getSelectedSpecies()
        }

        let forms = getFormsOfSelectedVariety()

        return (
            <FormSelector
                index={props.index}
                versionGroupId={props.versionGroupId}
                hideTooltips={props.hideTooltips}
                forms={forms}
                formId={formId}
                variety={props.variety}
                setForm={setForm}
                loading={loadingForms}
                shouldMarkInvalid={!props.ignoreValidity && forms.length >= 2} />
        )
    }

    /**
     * Renders the buttons.
     */
    const renderButtons = () => {
        let randomDisabled = getFilteredSpecies().length <= 0
        let randomStyle = CssHelper.defaultCursorIf(randomDisabled)

        let speciesId = props.speciesId
        let speciesIsReady = !speciesId === undefined && !isLoading()
        let clearStyle = CssHelper.defaultCursorIf(!speciesIsReady)
        let faveStyle = CssHelper.defaultCursorIf(!speciesIsReady)

        let isFavourite = speciesId !== undefined && favouriteSpecies.includes(speciesId)

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
                        onMouseUp={() => toggleFavouriteSpecies(speciesId)}>
                        <span title={speciesId ? faveTooltip : undefined}>
                            {faveIcon}
                        </span>
                    </Button>
                </div>
            </div>
        )
    }

    /**
     * Returns the forms of the selected variety.
     */
    const getFormsOfVariety = (varietyId: number) => {
        if (formsDict.length <= 0) {
            return []
        }

        let forms = formsDict.find(e => e.id === varietyId)
        if (forms === undefined) {
            return []
        }

        return forms.data
    }

    /**
     * Returns the forms of the selected variety.
     */
    const getFormsOfSelectedVariety = () => {
        return varietyId === undefined ? [] : getFormsOfVariety(varietyId)
    }

    /**
     * Returns whether the component is loading.
     */
    const isLoading = () => {
        return loadingForms || loadingVarieties
    }

    /**
     * Returns whether the species has secondary varieties.
     */
    const hasSecondaryVarieties = () => {
        return varieties.length >= 2
    }

    /**
     * Returns whether the variety has secondary forms.
     */
    const hasSecondaryForms = () => {
        let forms = getFormsOfSelectedVariety()
        return forms.length >= 2
    }

    /**
     * Returns the species that match the species filter.
     */
    const getFilteredSpecies = () => {
        return props.speciesInfo.filter(isPresent)
    }

    /**
     * Returns whether the species passes the filter.
     */
    const isPresent = (species: PokemonSpeciesInfo) => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${props.index}: version group ID is undefined!`
            )
        }

        // generation filter test
        let generationId = species.species!.generationId
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
     * Set this selector to the species with the given ID.
     */
    const setSpecies = (species: PokemonSpeciesEntry | undefined) => {
        // only fetch if we need to
        let speciesId = props.speciesId
        let speciesChanged = species?.pokemonSpeciesId !== speciesId
        if (speciesId === undefined || speciesChanged) {
            setVarietyId(undefined)
            setFormId(undefined)
            setVarieties([])
            setFormsDict([])

            if (speciesId !== undefined && speciesChanged) {
                // invalidate cookies from previous species
                let index = props.index
                CookieHelper.remove(`varietyId${index}`)
                CookieHelper.remove(`formId${index}`)
            }

            props.setSpecies(species)
            fetchVarieties(species)
        }
    }

    /**
     * Sets the variety.
     */
    const setVariety = (variety: PokemonEntry) => {
        setVarietyId(variety.pokemonId)
        props.setVariety(variety)
    }

    /**
     * Sets the form.
     */
    const setForm = (form: PokemonFormEntry) => {
        console.log(`setForm ${form.pokemonFormId}`)
        setFormId(form.pokemonFormId)
        props.setForm(form)
    }

    /**
     * Returns the data object for the species with the given ID.
     */
    const getSpecies = (pokemonSpeciesId: number) => {
        let allSpecies = props.speciesInfo

        let species = allSpecies.find(s => s.pokemonSpeciesId === pokemonSpeciesId)
        if (species === undefined) {
            throw new Error(
                `Selector ${props.index}: no species found with ID ${pokemonSpeciesId}!`
            )
        }

        return species
    }

    /**
     * Returns the data object for the selected species.
     */
    const getSelectedSpecies = () => {
        let speciesId = props.speciesId
        if (speciesId === undefined) {
            throw new Error(
                `Selector ${props.index}: species ID is undefined!`
            )
        }

        return getSpecies(speciesId)
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    const getForm = (formId: number) => {
        let allForms = getFormsOfSelectedVariety()

        let form = allForms.find(f => f.pokemonFormId === formId)
        if (form === undefined) {
            throw new Error(`Selector ${props.index}: no form found with ID ${formId}!`)
        }

        return form
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

        setSpecies(species)

        // set cookie
        CookieHelper.set(`speciesId${props.index}`, species.pokemonSpeciesId)
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
    const clearPokemon = () => {
        // clear cookies
        let index = props.index
        CookieHelper.remove(`speciesId${index}`)
        CookieHelper.remove(`varietyId${index}`)
        CookieHelper.remove(`formId${index}`)

        setVarietyId(undefined)
        setFormId(undefined)
        setVarieties([])
        setFormsDict([])

        props.setSpecies(undefined)
    }

    /**
     * Returns the rating of the selected species.
     */
    const getSpeciesRating = () => {
        let speciesId = props.speciesId
        if (speciesId === undefined) {
            return null
        }

        return speciesRatings.find(r => r.id === speciesId)?.rating ?? null
    }

    /**
     * Sets a new rating for the selected species.
     */
    const setSpeciesRating = (newRating: number | null) => {
        let speciesId = props.speciesId
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

    /**
     * Fetches the species varieties from SpeciesController.
     */
    const fetchVarieties = async (species: PokemonSpeciesEntry | undefined) => {
        if (species === undefined) {
            return
        }

        let speciesId = species.pokemonSpeciesId
        console.log(`Selector ${props.index}: fetching varieties for Pokemon species ${speciesId}...`)

        setLoadingVarieties(true)

        await fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}/varieties/${props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${props.index}: tried to fetch varieties for Pokemon species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((varieties: PokemonEntry[]) => {
                setVarieties(varieties)

                let variety = varieties[0]

                // set variety from cookies if possible
                let varietyId = CookieHelper.getNumber(`varietyId${props.index}`)
                if (varietyId !== undefined) {
                    let matchingVariety = varieties.find(p => p.pokemonId === varietyId)
                    if (matchingVariety === undefined) {
                        throw new Error(`Selector ${props.index}: no variety found with ID ${varietyId}!`)
                    }

                    variety = matchingVariety
                }
                else {
                    // set cookie if unset
                    CookieHelper.set(`varietyId${props.index}`, variety.pokemonId)
                }

                setVariety(variety)
            })
            .catch(error => console.error(error))
            .then(() => setLoadingVarieties(false))
            .then(() => {
                if (speciesId !== undefined) {
                    fetchForms(speciesId)
                }
            })
    }

    /**
     * Fetches the forms of the varieties of the species with the given ID.
     */
    const fetchForms = async (pokemonSpeciesId: number) => {
        if (pokemonSpeciesId <= 0) {
            return
        }

        console.log(`Selector ${props.index}: fetching forms for varieties of Pokemon species ${pokemonSpeciesId}...`)

        setLoadingForms(true)

        // fetch forms
        await fetch(`${process.env.REACT_APP_API_URL}/species/${pokemonSpeciesId}/forms/${props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${props.index}: tried to fetch forms for varieties of Pokemon species ${pokemonSpeciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((formsDict: FormsDict) => {
                setFormsDict(formsDict)

                console.log("FORMS")
                console.log(formsDict)

                // set form of selected variety
                // TODO: varietyId is undefined when this is called
                let matchingForm = formsDict.find(e => e.id === varietyId)
                if (matchingForm === undefined) {
                    throw new Error(`Selector ${props.index}: no matching form found for variety ${varietyId}!`)
                }

                let forms = matchingForm.data
                let form = forms[0]

                console.log("FORM")
                console.log(form)

                // set form from cookies if possible
                let formId = CookieHelper.getNumber(`formId${props.index}`)
                if (formId !== undefined) {
                    let matchingForm = forms.find(f => f.pokemonFormId === formId)
                    if (matchingForm === undefined) {
                        throw new Error(`Selector ${props.index}: no matching form found with ID ${formId}!`)
                    }

                    form = matchingForm
                }
                else {
                    // set cookie if unset
                    CookieHelper.set(`formId${props.index}`, form.pokemonFormId)
                }

                setForm(form)
            })
            .catch(error => console.error(error))
            .then(() => setLoadingForms(false))
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
