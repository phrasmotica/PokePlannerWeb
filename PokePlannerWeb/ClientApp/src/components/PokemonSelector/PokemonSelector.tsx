import React, { Component } from "react"
import { Button } from "reactstrap"
import { TiArrowShuffle, TiDelete } from "react-icons/ti"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

import { FormSelector } from "./FormSelector"
import { SpeciesSelector } from "./SpeciesSelector"
import { VarietySelector } from "./VarietySelector"

import { BaseStatFilterValues } from "../SpeciesFilter/BaseStatFilterValues"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { WithId } from "../../models/WithId"

import { CookieHelper } from "../../util/CookieHelper"

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
     * The IDs of the generations that pass the filter.
     */
    filteredGenerationIds: number[]

    /**
     * The IDs of the types that pass the filter.
     */
    filteredTypeIds: number[]

    /**
     * The IDs of the types to filter.
     */
    baseStatMinValues: BaseStatFilterValues

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number | undefined) => void

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
    speciesId: number | undefined

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
    formsDict: WithId<PokemonFormEntry[]>[]

    /**
     * Whether we're loading the Pokemon's forms.
     */
    loadingForms: boolean

    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean
}

/**
 * Component for selecting a Pokemon.
 */
export class PokemonSelector extends Component<IPokemonSelectorProps, IPokemonSelectorState> {
    constructor(props: IPokemonSelectorProps) {
        super(props)
        this.state = {
            speciesId: undefined,
            varietyId: undefined,
            varieties: [],
            loadingVarieties: false,
            formId: undefined,
            formsDict: [],
            loadingForms: false,
            validityTooltipOpen: false
        }
    }

    /**
     * Set species from cookie.
     */
    componentDidMount() {
        let index = this.props.index

        let speciesId = CookieHelper.getNumber(`speciesId${index}`)
        if (speciesId !== undefined) {
            let speciesIds = this.props.species.map(s => s.speciesId)
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
            let speciesIds = this.props.species.map(s => s.speciesId)
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
                entryId={this.state.speciesId}
                loading={false}
                generations={this.props.generations}
                filteredGenerationIds={this.props.filteredGenerationIds}
                filteredTypeIds={this.props.filteredTypeIds}
                baseStatMinValues={this.props.baseStatMinValues}
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
        if (this.state.speciesId !== undefined) {
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
        if (this.state.speciesId !== undefined) {
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
        let clearDisabled = this.state.speciesId === undefined || this.isLoading()

        return (
            <div className="margin-bottom-small">
                <span title="Random species">
                    <Button
                        color="warning"
                        className="selector-button margin-right-small"
                        onMouseUp={() => this.setRandomSpecies()}>
                        <TiArrowShuffle className="selector-button-icon" />
                    </Button>
                </span>

                <span title={clearDisabled ? undefined : "Clear"}>
                    <Button
                        color="danger"
                        style={{ cursor: clearDisabled ? "default" : "pointer" }}
                        className="selector-button margin-right-small"
                        disabled={clearDisabled}
                        onMouseUp={() => this.clearPokemon()}>
                        <TiDelete className="selector-button-icon" />
                    </Button>
                </span>
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
     * Set this selector to the species with the given ID.
     */
    setSpecies(newSpeciesId: number | undefined) {
        // only fetch if we need to
        let selectedSpeciesId = this.state.speciesId
        let speciesChanged = newSpeciesId !== selectedSpeciesId
        if (selectedSpeciesId === undefined || speciesChanged) {
            this.setState({
                speciesId: newSpeciesId,
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
        this.setState({ formId: form.formId })
        this.props.setForm(form)
    }

    /**
     * Returns the data object for the species with the given ID.
     */
    getSpecies(speciesId: number) {
        let allSpecies = this.props.species

        let species = allSpecies.find(s => s.speciesId === speciesId)
        if (species === undefined) {
            throw new Error(
                `Selector ${this.props.index}: no species found with ID ${speciesId}!`
            )
        }

        return species
    }

    /**
     * Returns the data object for the selected species.
     */
    getSelectedSpecies() {
        let speciesId = this.state.speciesId
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

        let form = allForms.find(f => f.formId === formId)
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

        let max = this.props.species.length
        let randomIndex = this.randomInt(0, max)
        let species = this.props.species[randomIndex]

        this.setSpecies(species.speciesId)

        // set cookie
        CookieHelper.set(`speciesId${this.props.index}`, species.speciesId)
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
            speciesId: undefined,
            varietyId: undefined,
            varieties: [],
            formId: undefined,
            formsDict: []
        })

        this.props.clearPokemon()
    }

    /**
     * Fetches the species varieties from SpeciesController.
     */
    async fetchVarieties(speciesId: number | undefined) {
        if (speciesId === undefined) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching varieties for Pokemon species ${speciesId}...`)

        this.setState({ loadingVarieties: true })

        await fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}/varieties/${this.props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch varieties for Pokemon species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((varieties: PokemonEntry[]) => {
                let concreteVarieties = varieties.map(PokemonEntry.from)
                this.setState({ varieties: concreteVarieties })

                let variety = concreteVarieties[0]

                // set variety from cookies if possible
                let varietyId = CookieHelper.getNumber(`varietyId${this.props.index}`)
                if (varietyId !== undefined) {
                    let matchingVariety = concreteVarieties.find(p => p.pokemonId === varietyId)
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
                let speciesId = this.state.speciesId
                if (speciesId !== undefined) {
                    this.fetchForms(speciesId)
                }
            })
    }

    /**
     * Fetches the forms of the varieties of the species with the given ID.
     */
    async fetchForms(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching forms for varieties of Pokemon species ${speciesId}...`)

        this.setState({ loadingForms: true })

        // fetch forms
        await fetch(`${process.env.REACT_APP_API_URL}/species/${speciesId}/forms/${this.props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch forms for varieties of Pokemon species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((formsDict: WithId<PokemonFormEntry[]>[]) => {
                // construct form objects
                let concreteFormsDict = formsDict.map(fd => {
                    return {
                        id: fd.id,
                        data: fd.data.map(PokemonFormEntry.from),
                    }
                })

                this.setState({ formsDict: concreteFormsDict })

                // set form of selected variety
                let varietyId = this.state.varietyId
                let matchingForm = concreteFormsDict.find(e => e.id === varietyId)
                if (matchingForm === undefined) {
                    throw new Error(`Selector ${this.props.index}: no matching form found for variety ${varietyId}!`)
                }

                let forms = matchingForm.data
                let form = forms[0]

                // set form from cookies if possible
                let formId = CookieHelper.getNumber(`formId${this.props.index}`)
                if (formId !== undefined) {
                    let matchingForm = forms.find(f => f.formId === formId)
                    if (matchingForm === undefined) {
                        throw new Error(`Selector ${this.props.index}: no matching form found with ID ${formId}!`)
                    }

                    form = matchingForm
                }
                else {
                    // set cookie if unset
                    CookieHelper.set(`formId${this.props.index}`, form.formId)
                }

                this.setForm(form)
            })
            .catch(error => console.error(error))
            .then(() => this.setState({ loadingForms: false }))
    }
}
