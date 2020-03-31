import React, { Component } from "react"
import { Button, Tooltip } from "reactstrap"
import Select from "react-select"

import "../styles/types.scss"
import "./TeamBuilder.scss"
import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "./CommonMembers"

interface IPokemonSelectorProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * List of Pokemon species.
     */
    species: any[]

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
    setVariety: (variety: any) => void

    /**
     * Handler for clearing the Pokemon in the parent component.
     */
    clearPokemon: () => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: any) => void

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokemonSelectorState {
    /**
     * The option of the species.
     */
    speciesOption: any

    /**
     * The option of the selected species variety.
     */
    varietyOption: any

    /**
     * The species' varieties.
     */
    varieties: any[]

    /**
     * Whether we're loading the species' varieties.
     */
    loadingVarieties: boolean

    /**
     * The option of the Pokemon form.
     */
    formOption: any

    /**
     * List of objects mapping variety IDs to the variety's forms.
     */
    formsDict: any[]

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
    constructor(props: any) {
        super(props)
        this.state = {
            speciesOption: null,
            varietyOption: null,
            varieties: [],
            loadingVarieties: false,
            formOption: null,
            formsDict: [],
            loadingForms: false,
            validityTooltipOpen: false
        }

        this.createVarietyOption = this.createVarietyOption.bind(this)
        this.createFormOption = this.createFormOption.bind(this)
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

        // attach validity tooltip and red border if necessary
        let idPrefix = "speciesSelect"
        let validityTooltip = null
        if (hasNoVariants) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let customStyles = this.createCustomSelectStyles(hasNoVariants)
        const onChange = (speciesOption: any) => {
            // cascades to set first variety and form
            this.setSpecies(speciesOption)
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
                value={this.state.speciesOption}
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

        // attach validity tooltip and red border if necessary
        let idPrefix = "varietySelect"
        let validityTooltip = null
        if (hasVarieties) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasVarieties ? "Select a variety!" : "No varieties"
        let customStyles = this.createCustomSelectStyles(hasVarieties)
        const onChange = (option: any) => {
            this.setState({ varietyOption: option })

            let variety = this.getVariety(option.value)
            this.props.setVariety(variety)

            // set first form
            let forms = this.getFormsOfVariety(option.value)
            let form = forms[0]
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
                value={hasVarieties ? this.state.varietyOption : null}
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

        // attach validity tooltip and red border if necessary
        let idPrefix = "formSelect"
        let validityTooltip = null
        if (hasForms) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasForms ? "Select a form!" : "No forms"
        let customStyles = this.createCustomSelectStyles(hasForms)
        const onChange = (option: any) => {
            this.setState({ formOption: option })

            let form = this.getForm(option.value)
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
                value={hasForms ? this.state.formOption : null}
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
        return this.props.species.map(species => ({
            label: species.displayNames.filter((n: any) => n.language === "en")[0].name,
            value: species.speciesId
        }))
    }

    // returns options for the variety select
    createVarietyOptions() {
        if (!this.hasSecondaryVarieties()) {
            return []
        }

        return this.state.varieties.map(this.createVarietyOption)
    }

    /**
     * Creates an option for the given variety.
     */
    createVarietyOption(variety: any) {
        // default varieties derive name from their species
        let label = this.state.speciesOption.label

        let forms = this.getFormsOfVariety(variety.pokemonId)
        if (forms.length > 0) {
            let form = forms[0]

            let formNames = form.displayNames
            if (formNames.length > 0) {
                // non-default forms have their own name
                let matchingNames = formNames.filter((n: any) => n.language === "en")
                label = matchingNames[0].name
            }
        }

        return {
            label: label,
            value: variety.pokemonId
        }
    }

    // returns options for the form select
    createFormOptions() {
        if (!this.hasSecondaryForms()) {
            return []
        }

        let forms = this.getFormsOfSelectedVariety()
        return forms.map(this.createFormOption)
    }

    /**
     * Creates an option for the given form.
     */
    createFormOption(form: any) {
        // default forms derive name from their species
        let label = this.state.speciesOption.label

        let formNames = form.displayNames
        if (formNames.length > 0) {
            // non-default forms have their own name
            let matchingNames = formNames.filter((n: any) => n.language === "en")
            label = matchingNames[0].name
        }

        return {
            label: label,
            value: form.formId
        }
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfVariety(varietyId: number) {
        if (this.state.formsDict.length <= 0) {
            return []
        }

        let matchingForms = this.state.formsDict.filter((e: any) => e.id === varietyId)
        return matchingForms[0].data
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfSelectedVariety() {
        if (!this.hasVariety()) {
            return []
        }

        let varietyId = this.state.varietyOption.value
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

    // returns true if we have a species variety
    hasVariety() {
        return this.state.varietyOption !== null
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
        if (this.state.formOption === null) {
            return false
        }

        if (this.state.speciesOption === null) {
            return false
        }

        let selectedForm = this.getSelectedForm()
        if (selectedForm === undefined) {
            return false
        }

        let speciesValidity = this.getSelectedSpecies().validity
        let pokemonIsValid = speciesValidity.includes(this.props.versionGroupId)

        let formValidity = selectedForm.validity
        if (formValidity.length > 0) {
            // can only obtain form if base species is obtainable
            pokemonIsValid &= formValidity.includes(this.props.versionGroupId)
        }

        return !this.props.ignoreValidity && !pokemonIsValid
    }

    /**
     * Set this selector to the species represented by the given option.
     */
    setSpecies(newSpeciesOption: any) {
        // only fetch if we need to
        let currentOption = this.state.speciesOption
        if (currentOption === null || newSpeciesOption.value !== currentOption.value) {
            this.setState({
                speciesOption: newSpeciesOption,
                varietyOption: null,
                varieties: [],
                formOption: null,
                formsDict: []
            })

            this.props.setSpecies(newSpeciesOption.value)
            this.fetchVarieties(newSpeciesOption.value)
        }
    }


    setVariety(variety: any) {
        let varietyOption = this.createVarietyOption(variety)
        // (for TODO below) varietyOption needs to be set so
        // we can fetch forms for its value (the variety ID).
        // maybe needs a rethink so we only store the variety ID
        // in state?
        this.setState({ varietyOption: varietyOption })
        this.props.setVariety(variety)
    }


    setForm(form: any) {
        let formOption = this.createFormOption(form)

        // TODO: species with primary varieties whose form's display name
        // differs from the species display name don't have the form name
        // appear straight away in the variety option when selecting the species.
        // Make it so the variety option is set with the correct display name
        // only once we have the form

        this.setState({
            varietyOption: formOption,
            formOption: formOption
        })

        this.props.setForm(form)
    }

    /**
     * Returns the data object for the selected species.
     */
    getSelectedSpecies() {
        let allSpecies = this.props.species
        let selectedSpeciesId = this.state.speciesOption.value
        let matchingSpecies = allSpecies.filter((s: any) => s.speciesId === selectedSpeciesId)
        return matchingSpecies[0]
    }

    /**
     * Returns the data object for the species variety with the given ID.
     */
    getVariety(varietyId: number) {
        let allVarieties = this.state.varieties
        let matchingVarieties = allVarieties.filter((p: any) => p.pokemonId === varietyId)
        return matchingVarieties[0]
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.getFormsOfSelectedVariety()
        let matchingForms = allForms.filter((f: any) => f.formId === formId)
        return matchingForms[0]
    }

    /**
     * Returns the data object for the selected Pokemon form.
     */
    getSelectedForm() {
        let selectedFormId = this.state.formOption.value
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

        let speciesOption = {
            label: species.displayNames.filter((n: any) => n.language === "en")[0].name,
            value: species.speciesId
        }

        this.setSpecies(speciesOption)
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
        this.setState({
            speciesOption: null,
            formsDict: [],
            formOption: null,
            varieties: [],
            varietyOption: null
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
            .then(varieties => {
                this.setState({ varieties: varieties })

                // set first variety
                let variety = varieties[0]
                this.setVariety(variety)
            })
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVarieties: false }))
            .then(() => this.fetchForms(this.state.speciesOption.value))
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
            .then(forms => {
                this.setState({ formsDict: forms })

                // set first form
                let form = forms[0].data[0]
                this.setForm(form)
            })
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingForms: false }))
    }
}
