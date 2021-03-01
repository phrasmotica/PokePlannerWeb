import React, { Component } from "react"
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
import { getBaseStats, getTypes } from "../../models/Helpers"

import {
    GenerationEntry,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"
import { CssHelper } from "../../util/CssHelper"

import "../../styles/types.scss"
import "./PokemonSelector.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface IPokemonSelectorProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

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
    generations: GenerationEntry[]

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
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (pokemonSpeciesId: number | undefined) => void

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: PokemonEntry) => void

    /**
     * Handler for clearing the Pokemon in the parent component.
     */
    clearPokemon: () => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleSpeciesFilter: () => void

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokemonSelectorState {
    /**
     * The ID of the species.
     */
    pokemonSpeciesId: number | undefined

    /**
     * The ID of the selected species variety.
     */
    varietyId: number | undefined

    /**
     * The species' varieties.
     */
    varieties: PokemonEntry[]

    /**
     * Whether we're loading the species' varieties.
     */
    loadingVarieties: boolean

    /**
     * The ID of the selected Pokemon form.
     */
    formId: number | undefined

    /**
     * List of objects mapping variety IDs to the variety's forms.
     */
    formsDict: FormsDict

    /**
     * Whether we're loading the Pokemon's forms.
     */
    loadingForms: boolean

    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean

    /**
     * List of the user's species ratings.
     */
    speciesRatings: { id: number, rating: number }[]

    /**
     * List of the user's favourite species.
     */
    favouriteSpecies: number[]
}

/**
 * Component for selecting a Pokemon.
 */
export class PokemonSelector extends Component<IPokemonSelectorProps, IPokemonSelectorState> {
    constructor(props: IPokemonSelectorProps) {
        super(props)
        this.state = {
            pokemonSpeciesId: undefined,
            varietyId: undefined,
            varieties: [],
            loadingVarieties: false,
            formId: undefined,
            formsDict: [],
            loadingForms: false,
            validityTooltipOpen: false,
            speciesRatings: [],
            favouriteSpecies: []
        }
    }

    /**
     * Set species from cookie.
     */
    componentDidMount() {
        let index = this.props.index

        let speciesId = CookieHelper.getNumber(`speciesId${index}`)
        if (speciesId !== undefined) {
            let speciesIds = this.props.species.map(s => s.pokemonSpeciesId)
            if (speciesIds.includes(speciesId)) {
                // cascades to set variety and form
                this.setSpecies(speciesId)
            }
            else {
                // remove cookies for species that isn't available
                CookieHelper.remove(`speciesId${index}`)
                CookieHelper.remove(`varietyId${index}`)
                CookieHelper.remove(`formId${index}`)
            }
        }
    }

    /**
     * Set species from props if necessary.
     */
    componentDidUpdate(previousProps: IPokemonSelectorProps) {
        let defaultSpeciesId = this.props.defaultSpeciesId
        if (previousProps.defaultSpeciesId !== defaultSpeciesId) {
            let speciesIds = this.props.species.map(s => s.pokemonSpeciesId)
            if (defaultSpeciesId !== undefined && speciesIds.includes(defaultSpeciesId)) {
                this.setSpecies(defaultSpeciesId)

                // set cookie
                CookieHelper.set(`speciesId${this.props.index}`, defaultSpeciesId)
            }
            else {
                // remove cookies for species that isn't available
                this.setSpecies(undefined)

                let index = this.props.index
                CookieHelper.remove(`speciesId${index}`)
                CookieHelper.remove(`varietyId${index}`)
                CookieHelper.remove(`formId${index}`)
            }
        }
    }

    /**
     * Renders the component.
     */
    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()
        let varietySelect = this.renderVarietySelect()
        let formSelect = this.renderFormSelect()
        let buttons = this.renderButtons()

        return (
            <div className="margin-right">
                {speciesSelect}
                {varietySelect}
                {formSelect}
                {buttons}
            </div>
        )
    }

    /**
     * Renders the species select box.
     */
    renderSpeciesSelect() {
        let hasNoVariants = !this.hasSecondaryForms() && !this.hasSecondaryVarieties()

        return (
            <SpeciesSelector
                index={this.props.index}
                versionGroupId={this.props.versionGroupId}
                hideTooltips={this.props.hideTooltips}
                entries={this.props.species}
                entryId={this.state.pokemonSpeciesId}
                loading={false}
                generations={this.props.generations}
                generationFilter={this.props.generationFilter}
                typeFilter={this.props.typeFilter}
                baseStatFilter={this.props.baseStatFilter}
                setSpecies={id => this.setSpecies(id)}
                toggleFilter={() => this.props.toggleSpeciesFilter()}
                shouldMarkInvalid={!this.props.ignoreValidity && hasNoVariants} />
        )
    }

    /**
     * Renders the variety select box.
     */
    renderVarietySelect() {
        let species = undefined
        if (this.state.pokemonSpeciesId !== undefined) {
            species = this.getSelectedSpecies()
        }

        let varieties = this.state.varieties

        return (
            <VarietySelector
                index={this.props.index}
                versionGroupId={this.props.versionGroupId}
                hideTooltips={this.props.hideTooltips}
                entries={varieties}
                entryId={this.state.varietyId}
                species={species}
                formsDict={this.state.formsDict}
                formId={this.state.formId}
                setVariety={(variety: PokemonEntry) => this.setVariety(variety)}
                setForm={(form: PokemonFormEntry) => this.setForm(form)}
                loading={this.state.loadingVarieties}
                shouldMarkInvalid={!this.props.ignoreValidity && varieties.length >= 2} />
        )
    }

    /**
     * Renders the form select box.
     */
    renderFormSelect() {
        let species = undefined
        if (this.state.pokemonSpeciesId !== undefined) {
            species = this.getSelectedSpecies()
        }

        let forms = this.getFormsOfSelectedVariety()

        return (
            <FormSelector
                index={this.props.index}
                versionGroupId={this.props.versionGroupId}
                hideTooltips={this.props.hideTooltips}
                entries={forms}
                entryId={this.state.formId}
                species={species}
                setForm={(form: PokemonFormEntry) => this.setForm(form)}
                loading={this.state.loadingForms}
                shouldMarkInvalid={!this.props.ignoreValidity && forms.length >= 2} />
        )
    }

    /**
     * Renders the buttons.
     */
    renderButtons() {
        let randomDisabled = this.getFilteredSpecies().length <= 0
        let randomStyle = CssHelper.defaultCursorIf(randomDisabled)

        let speciesIsReady = !this.state.pokemonSpeciesId === undefined && !this.isLoading()
        let clearStyle = CssHelper.defaultCursorIf(!speciesIsReady)
        let faveStyle = CssHelper.defaultCursorIf(!speciesIsReady)

        let speciesId = this.state.pokemonSpeciesId
        let favouriteSpecies = this.state.favouriteSpecies
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
                        onMouseUp={() => this.setRandomSpecies()}>
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
                        onMouseUp={() => this.clearPokemon()}>
                        <span title={speciesIsReady ? "Clear" : undefined}>
                            <TiDelete className="selector-button-icon" />
                        </span>
                    </Button>
                </div>

                <div className="flex-center margin-right-small">
                    <Rating
                        size="large"
                        disabled={!speciesIsReady}
                        value={this.getSpeciesRating()}
                        onChange={(_, newRating) => this.setSpeciesRating(newRating)} />
                </div>

                <div className="flex-center margin-right-small">
                    <Button
                        color="primary"
                        style={faveStyle}
                        className="selector-button"
                        disabled={!speciesIsReady}
                        onMouseUp={() => this.toggleFavouriteSpecies(this.state.pokemonSpeciesId)}>
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
    getFormsOfVariety(varietyId: number) {
        if (this.state.formsDict.length <= 0) {
            return []
        }

        let forms = this.state.formsDict.find(e => e.id === varietyId)
        if (forms === undefined) {
            return []
        }

        return forms.data
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfSelectedVariety() {
        let varietyId = this.state.varietyId
        if (varietyId === undefined) {
            return []
        }

        return this.getFormsOfVariety(varietyId)
    }

    /**
     * Returns whether the component is loading.
     */
    isLoading() {
        return this.state.loadingForms || this.state.loadingVarieties
    }

    /**
     * Returns whether the species has secondary varieties.
     */
    hasSecondaryVarieties() {
        return this.state.varieties.length >= 2
    }

    /**
     * Returns whether the variety has secondary forms.
     */
    hasSecondaryForms() {
        let forms = this.getFormsOfSelectedVariety()
        return forms.length >= 2
    }

    /**
     * Returns the species that match the species filter.
     */
    getFilteredSpecies() {
        return this.props.species.filter(s => this.isPresent(s))
    }

    /**
     * Returns whether the species passes the filter.
     */
    isPresent(species: PokemonSpeciesEntry) {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${this.props.index}: version group ID is undefined!`
            )
        }

        // generation filter test
        let generationId = species.generation.generationId
        let passesGenerationFilter = this.props.generationFilter.passesFilter([generationId])

        // type filter test
        let speciesTypes = getTypes(species, versionGroupId).map(t => t.typeId)
        let passesTypeFilter = this.props.typeFilter.passesFilter(speciesTypes)

        // base stat filter test
        let speciesBaseStats = getBaseStats(species, versionGroupId)
        let passesBaseStatFilter = this.props.baseStatFilter.passesFilter(speciesBaseStats)

        return passesGenerationFilter && passesTypeFilter && passesBaseStatFilter
    }

    /**
     * Set this selector to the species with the given ID.
     */
    setSpecies(newSpeciesId: number | undefined) {
        // only fetch if we need to
        let selectedSpeciesId = this.state.pokemonSpeciesId
        let speciesChanged = newSpeciesId !== selectedSpeciesId
        if (selectedSpeciesId === undefined || speciesChanged) {
            this.setState({
                pokemonSpeciesId: newSpeciesId,
                varietyId: undefined,
                varieties: [],
                formId: undefined,
                formsDict: []
            })

            if (selectedSpeciesId !== undefined && speciesChanged) {
                // invalidate cookies from previous species
                let index = this.props.index
                CookieHelper.remove(`varietyId${index}`)
                CookieHelper.remove(`formId${index}`)
            }

            this.props.setSpecies(newSpeciesId)
            this.fetchVarieties(newSpeciesId)
        }
    }

    /**
     * Sets the variety.
     */
    setVariety(variety: PokemonEntry) {
        this.setState({ varietyId: variety.pokemonId })
        this.props.setVariety(variety)
    }

    /**
     * Sets the form.
     */
    setForm(form: PokemonFormEntry) {
        this.setState({ formId: form.pokemonFormId })
        this.props.setForm(form)
    }

    /**
     * Returns the data object for the species with the given ID.
     */
    getSpecies(pokemonSpeciesId: number) {
        let allSpecies = this.props.species

        let species = allSpecies.find(s => s.pokemonSpeciesId === pokemonSpeciesId)
        if (species === undefined) {
            throw new Error(
                `Selector ${this.props.index}: no species found with ID ${pokemonSpeciesId}!`
            )
        }

        return species
    }

    /**
     * Returns the data object for the selected species.
     */
    getSelectedSpecies() {
        let speciesId = this.state.pokemonSpeciesId
        if (speciesId === undefined) {
            throw new Error(
                `Selector ${this.props.index}: species ID is undefined!`
            )
        }

        return this.getSpecies(speciesId)
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.getFormsOfSelectedVariety()

        let form = allForms.find(f => f.pokemonFormId === formId)
        if (form === undefined) {
            throw new Error(`Selector ${this.props.index}: no form found with ID ${formId}!`)
        }

        return form
    }

    /**
     * Set this selector to a random species.
     */
    setRandomSpecies() {
        // ignore validity since we can't guarantee a valid Pokemon
        if (!this.props.ignoreValidity) {
            this.props.toggleIgnoreValidity()
        }

        let speciesList = this.getFilteredSpecies()

        let max = speciesList.length
        let randomIndex = this.randomInt(0, max)
        let species = speciesList[randomIndex]

        this.setSpecies(species.pokemonSpeciesId)

        // set cookie
        CookieHelper.set(`speciesId${this.props.index}`, species.pokemonSpeciesId)
    }

    /**
     * Returns a random integer between the min (inclusive) and the max (exclusive).
     */
    randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    /**
     * Empty this selector.
     */
    clearPokemon() {
        // clear cookies
        let index = this.props.index
        CookieHelper.remove(`speciesId${index}`)
        CookieHelper.remove(`varietyId${index}`)
        CookieHelper.remove(`formId${index}`)

        this.setState({
            pokemonSpeciesId: undefined,
            varietyId: undefined,
            varieties: [],
            formId: undefined,
            formsDict: []
        })

        this.props.clearPokemon()
    }

    /**
     * Returns the rating of the selected species.
     */
    getSpeciesRating() {
        let speciesId = this.state.pokemonSpeciesId
        if (speciesId === undefined) {
            return null
        }

        return this.state.speciesRatings.find(r => r.id === speciesId)?.rating ?? null
    }

    /**
     * Sets a new rating for the selected species.
     */
    setSpeciesRating(newRating: number | null) {
        let speciesId = this.state.pokemonSpeciesId
        if (speciesId === undefined) {
            return
        }

        let ratings = this.state.speciesRatings
        let current = ratings.findIndex(r => r.id === speciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (current >= 0 && newRating === null) {
            // remove existing rating
            ratings.splice(current, 1)

            console.log(ratings)
            this.setState({ speciesRatings: ratings })
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
            this.setState({ speciesRatings: ratings })
        }
    }

    /**
     * Toggles the favourite status of the species with the given ID.
     */
    toggleFavouriteSpecies(pokemonSpeciesId: number | undefined) {
        if (pokemonSpeciesId === undefined) {
            return
        }

        let favouriteSpecies = this.state.favouriteSpecies
        let i = favouriteSpecies.indexOf(pokemonSpeciesId)

        // TODO: write to a real DB somewhere. This will require user auth first since we
        // need a unique token for each user

        if (i < 0) {
            favouriteSpecies.push(pokemonSpeciesId)
        }
        else {
            favouriteSpecies.splice(i, 1)
        }

        this.setState({ favouriteSpecies: favouriteSpecies })
    }

    /**
     * Fetches the species varieties from SpeciesController.
     */
    async fetchVarieties(pokemonSpeciesId: number | undefined) {
        if (pokemonSpeciesId === undefined) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching varieties for Pokemon species ${pokemonSpeciesId}...`)

        this.setState({ loadingVarieties: true })

        await fetch(`${process.env.REACT_APP_API_URL}/species/${pokemonSpeciesId}/varieties/${this.props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch varieties for Pokemon species ${pokemonSpeciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((varieties: PokemonEntry[]) => {
                this.setState({ varieties: varieties })

                let variety = varieties[0]

                // set variety from cookies if possible
                let varietyId = CookieHelper.getNumber(`varietyId${this.props.index}`)
                if (varietyId !== undefined) {
                    let matchingVariety = varieties.find(p => p.pokemonId === varietyId)
                    if (matchingVariety === undefined) {
                        throw new Error(`Selector ${this.props.index}: no variety found with ID ${varietyId}!`)
                    }

                    variety = matchingVariety
                }
                else {
                    // set cookie if unset
                    CookieHelper.set(`varietyId${this.props.index}`, variety.pokemonId)
                }

                this.setVariety(variety)
            })
            .catch(error => console.error(error))
            .then(() => this.setState({ loadingVarieties: false }))
            .then(() => {
                let speciesId = this.state.pokemonSpeciesId
                if (speciesId !== undefined) {
                    this.fetchForms(speciesId)
                }
            })
    }

    /**
     * Fetches the forms of the varieties of the species with the given ID.
     */
    async fetchForms(pokemonSpeciesId: number) {
        if (pokemonSpeciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching forms for varieties of Pokemon species ${pokemonSpeciesId}...`)

        this.setState({ loadingForms: true })

        // fetch forms
        await fetch(`${process.env.REACT_APP_API_URL}/species/${pokemonSpeciesId}/forms/${this.props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch forms for varieties of Pokemon species ${pokemonSpeciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((formsDict: FormsDict) => {
                this.setState({ formsDict: formsDict })

                // set form of selected variety
                let varietyId = this.state.varietyId
                let matchingForm = formsDict.find(e => e.id === varietyId)
                if (matchingForm === undefined) {
                    throw new Error(`Selector ${this.props.index}: no matching form found for variety ${varietyId}!`)
                }

                let forms = matchingForm.data
                let form = forms[0]

                // set form from cookies if possible
                let formId = CookieHelper.getNumber(`formId${this.props.index}`)
                if (formId !== undefined) {
                    let matchingForm = forms.find(f => f.pokemonFormId === formId)
                    if (matchingForm === undefined) {
                        throw new Error(`Selector ${this.props.index}: no matching form found with ID ${formId}!`)
                    }

                    form = matchingForm
                }
                else {
                    // set cookie if unset
                    CookieHelper.set(`formId${this.props.index}`, form.pokemonFormId)
                }

                this.setForm(form)
            })
            .catch(error => console.error(error))
            .then(() => this.setState({ loadingForms: false }))
    }
}
