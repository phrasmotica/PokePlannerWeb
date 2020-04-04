import React, { Component } from "react"
import { Button, Tooltip } from "reactstrap"
import Select from "react-select"
import Cookies from "universal-cookie"

import { PokemonEntry } from "../models/PokemonEntry"
import { PokemonFormEntry } from "../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../models/PokemonSpeciesEntry"
import { WithId } from "../models/WithId"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "./CommonMembers"

import "../styles/types.scss"
import "./TeamBuilder.scss"

interface IPokemonSelectorProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number) => void

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

        let speciesId = this.getNumberCookie(`speciesId${index}`)
        if (speciesId !== undefined) {
            let speciesIds = this.props.species.map(s => s.speciesId)
            if (speciesIds.includes(speciesId)) {
                // cascades to set variety and form
                this.setSpecies(speciesId)
            }
            else {
                // remove cookies for species that isn't available
                let cookies = new Cookies()
                cookies.remove(`speciesId${index}`)
                cookies.remove(`varietyId${index}`)
                cookies.remove(`formId${index}`)
            }
        }
    }

    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()
        let varietySelect = this.renderVarietySelect()
        let formSelect = this.renderFormSelect()

        return (
            <div className="margin-right">
                {speciesSelect}
                {varietySelect}
                {formSelect}

                <div className="flex-space-between margin-bottom-small">
                    <Button
                        color="warning"
                        onMouseUp={() => this.setRandomSpecies()}>
                        Random Pokemon
                    </Button>

                    <Button
                        color="danger"
                        onMouseUp={() => this.clearPokemon()}>
                        Clear
                    </Button>
                </div>
            </div>
        )
    }

    // returns a box for selecting a species
    renderSpeciesSelect() {
        let speciesOptions = this.createSpeciesOptions()
        let hasNoVariants = !this.hasSecondaryForms() && !this.hasSecondaryVarieties()

        let selectedSpeciesOption = null
        let speciesId = this.state.speciesId
        if (speciesId !== undefined) {
            selectedSpeciesOption = speciesOptions.filter(o => o.value === speciesId)[0]
        }

        // attach validity tooltip and red border if necessary
        let idPrefix = "speciesSelect"
        let validityTooltip = null
        if (hasNoVariants) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let customStyles = this.createCustomSelectStyles(hasNoVariants)
        const onChange = (speciesOption: any) => {
            let speciesId = speciesOption.value

            // cascades to set first variety and form
            this.setSpecies(speciesId)

            // set cookie
            let cookies = new Cookies()
            cookies.set(`speciesId${this.props.index}`, speciesId)
        }

        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                id={idPrefix + this.props.index}
                styles={customStyles}
                placeholder="Select a species!"
                onChange={onChange}
                value={selectedSpeciesOption}
                options={speciesOptions} />
        )

        return (
            <div className="margin-bottom-small">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns a box for selecting a variety of the selected species
    renderVarietySelect() {
        let varietyOptions = this.createVarietyOptions()
        let hasVarieties = varietyOptions.length > 0
        let selectedVarietyOption = null

        // attach validity tooltip and red border if necessary
        let idPrefix = "varietySelect"
        let validityTooltip = null
        if (hasVarieties) {
            let varietyId = this.state.varietyId
            selectedVarietyOption = varietyOptions.filter(o => o.value === varietyId)[0]
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasVarieties ? "Select a variety!" : "-"
        let customStyles = this.createCustomSelectStyles(hasVarieties)
        const onChange = (option: any) => {
            let varietyId = option.value
            this.setState({ varietyId: varietyId })

            // set variety cookie
            let cookies = new Cookies()
            cookies.set(`varietyId${this.props.index}`, varietyId)

            let variety = this.getVariety(varietyId)
            this.props.setVariety(variety)

            // set first form
            let forms = this.getFormsOfVariety(varietyId)
            let form = forms[0]

            // set form cookie
            cookies.set(`formId${this.props.index}`, form.formId)

            this.setForm(form)
        }

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.state.loadingVarieties}
                isDisabled={!hasVarieties}
                id={idPrefix + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={onChange}
                value={selectedVarietyOption}
                options={varietyOptions} />
        )

        return (
            <div className="margin-bottom-small">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns a box for selecting a form of the selected Pokemon
    renderFormSelect() {
        let formOptions = this.createFormOptions()
        let hasForms = formOptions.length > 0
        let selectedFormOption = null

        // attach validity tooltip and red border if necessary
        let idPrefix = "formSelect"
        let validityTooltip = null
        if (hasForms) {
            let formId = this.state.formId
            selectedFormOption = formOptions.filter(o => o.value === formId)[0]
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasForms ? "Select a form!" : "-"
        let customStyles = this.createCustomSelectStyles(hasForms)
        const onChange = (option: any) => {
            let formId = option.value
            this.setState({ formId: formId })

            // set cookie
            let cookies = new Cookies()
            cookies.set(`formId${this.props.index}`, formId)

            let form = this.getForm(formId)
            this.props.setForm(form)
        }

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.state.loadingForms}
                isDisabled={!hasForms}
                id={idPrefix + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={onChange}
                value={selectedFormOption}
                options={formOptions} />
        )

        return (
            <div className="margin-bottom-small">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns a tooltip indicating the validity of the Pokemon
    renderValidityTooltip(idPrefix: string) {
        if (!this.props.hideTooltips && this.shouldMarkPokemonInvalid()) {
            return (
                <Tooltip
                    isOpen={this.state.validityTooltipOpen}
                    toggle={() => this.toggleValidityTooltip()}
                    placement="bottom"
                    target={idPrefix + this.props.index}>
                    Cannot be obtained in this game version!
                </Tooltip>
            )
        }

        return null
    }

    // returns options for the species select
    createSpeciesOptions() {
        // TODO: allow filtering species by types and other properties
        return this.props.species.map(species => {
            // needed to be able to call methods
            // otherwise species remains an object that only looks like
            // a species entry rather than an actually instance of the class
            let s = PokemonSpeciesEntry.from(species)

            return {
                label: s.getDisplayName("en"),
                value: s.speciesId
            }
        })
    }

    // returns options for the variety select
    createVarietyOptions() {
        if (!this.hasSecondaryVarieties()) {
            return []
        }

        // variety display names come from their forms
        if (this.state.formId === undefined) {
            return []
        }

        return this.state.varieties.map(variety => {
            // default varieties derive name from their species
            let species = this.getSelectedSpecies()
            let speciesName = species.getDisplayName("en")
            if (speciesName === undefined) {
                throw new Error(`Selector ${this.props.index}: no display name found for species ${species.speciesId}!`)
            }

            let label = speciesName

            let forms = this.getFormsOfVariety(variety.pokemonId)
            if (forms.length > 0) {
                let form = forms[0]

                let formNames = form.displayNames
                if (formNames.length > 0) {
                    // non-default forms have their own name
                    let matchingNames = formNames.filter(n => n.language === "en")
                    label = matchingNames[0].name
                }
            }

            return {
                label: label,
                value: variety.pokemonId
            }
        })
    }

    // returns options for the form select
    createFormOptions() {
        if (!this.hasSecondaryForms()) {
            return []
        }

        let forms = this.getFormsOfSelectedVariety()
        return forms.map(form => {
            // default varieties derive name from their species
            let species = this.getSelectedSpecies()
            let label = species.getDisplayName("en")

            let formNames = form.displayNames
            if (formNames.length > 0) {
                // non-default forms have their own name
                let matchingNames = formNames.filter(n => n.language === "en")
                label = matchingNames[0].name
            }

            return {
                label: label,
                value: form.formId
            }
        })
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfVariety(varietyId: number) {
        if (this.state.formsDict.length <= 0) {
            return []
        }

        let matchingForms = this.state.formsDict.filter(e => e.id === varietyId)
        return matchingForms[0].data
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

    // returns a custom style for the select boxes
    createCustomSelectStyles(markAsInvalid: boolean) {
        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                marginLeft: "auto"
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                border: markAsInvalid && this.shouldMarkPokemonInvalid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    // toggle the validity tooltip
    toggleValidityTooltip() {
        this.setState(previousState => ({
            validityTooltipOpen: !previousState.validityTooltipOpen
        }))
    }

    // returns true if the species has secondary varieties
    hasSecondaryVarieties() {
        return this.state.varieties.length >= 2
    }

    // returns true if the Pokemon has secondary forms
    hasSecondaryForms() {
        let forms = this.getFormsOfSelectedVariety()
        return forms.length >= 2
    }

    // returns true if the Pokemon should be marked as invalid
    shouldMarkPokemonInvalid() {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            return true
        }

        if (this.state.formId === undefined) {
            return false
        }

        if (this.state.speciesId === undefined) {
            return false
        }

        let speciesValidity = this.getSelectedSpecies().validity
        let pokemonIsValid = speciesValidity.includes(versionGroupId)

        let form = this.getSelectedForm()
        if (form !== undefined) {
            let formValidity = form.validity
            if (formValidity.length > 0) {
                // can only obtain form if base species is obtainable
                pokemonIsValid = pokemonIsValid && formValidity.includes(versionGroupId)
            }
        }

        return !this.props.ignoreValidity && !pokemonIsValid
    }

    /**
     * Set this selector to the species with the given ID.
     */
    setSpecies(newSpeciesId: number) {
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
                let cookies = new Cookies()
                cookies.remove(`varietyId${index}`)
                cookies.remove(`formId${index}`)
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

        return PokemonSpeciesEntry.from(species)
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
     * Returns the data object for the species variety with the given ID.
     */
    getVariety(varietyId: number) {
        let allVarieties = this.state.varieties
        let matchingVarieties = allVarieties.filter(p => p.pokemonId === varietyId)
        return matchingVarieties[0]
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.getFormsOfSelectedVariety()
        let matchingForms = allForms.filter(f => f.formId === formId)
        return matchingForms[0]
    }

    /**
     * Returns the data object for the selected Pokemon form.
     */
    getSelectedForm() {
        let selectedFormId = this.state.formId
        if (selectedFormId === undefined) {
            return undefined
        }

        return this.getForm(selectedFormId)
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
        let cookies = new Cookies()
        cookies.set(`speciesId${this.props.index}`, species.speciesId)
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
        let cookies = new Cookies()
        cookies.remove(`speciesId${index}`)
        cookies.remove(`varietyId${index}`)
        cookies.remove(`formId${index}`)

        this.setState({
            speciesId: undefined,
            varietyId: undefined,
            varieties: [],
            formId: undefined,
            formsDict: []
        })

        this.props.clearPokemon()
    }

    // fetches the species varieties from SpeciesController
    async fetchVarieties(speciesId: number) {
        if (speciesId <= 0) {
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
                this.setState({ varieties: varieties })

                let variety = varieties[0]

                // set variety from cookies if possible
                let varietyId = this.getNumberCookie(`varietyId${this.props.index}`)
                if (varietyId !== undefined) {
                    let matchingVarieties = varieties.filter(p => p.pokemonId === varietyId)
                    variety = matchingVarieties[0]
                }
                else {
                    // set cookie if unset
                    let cookies = new Cookies()
                    cookies.set(`varietyId${this.props.index}`, variety.pokemonId)
                }

                this.setVariety(variety)
            })
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVarieties: false }))
            .then(() => {
                let speciesId = this.state.speciesId
                if (speciesId !== undefined) {
                    this.fetchForms(speciesId)
                }
            })
    }

    // fetches the forms of the varieties of the species with the given ID
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
                this.setState({ formsDict: formsDict })

                // set form of selected variety
                let varietyId = this.state.varietyId
                let matchingForms = formsDict.filter(e => e.id === varietyId)
                let forms = matchingForms[0].data
                let form = forms[0]

                // set form from cookies if possible
                let formId = this.getNumberCookie(`formId${this.props.index}`)
                if (formId !== undefined) {
                    let matchingForms = forms.filter(f => f.formId === formId)
                    form = matchingForms[0]
                }
                else {
                    // set cookie if unset
                    let cookies = new Cookies()
                    cookies.set(`formId${this.props.index}`, form.formId)
                }

                this.setForm(form)
            })
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingForms: false }))
    }

    /**
     * Returns the cookie with the given name as a number, or undefined if not found.
     */
    getNumberCookie(name: string): number | undefined {
        let cookies = new Cookies()
        let cookie = cookies.get(name)
        if (cookie === undefined) {
            return undefined
        }

        return Number(cookie)
    }
}
