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
     * The Pokemon's forms.
     */
    forms: any[]

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
            forms: [],
            loadingForms: false,
            validityTooltipOpen: false
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

        // attach validity tooltip and red border if necessary
        let idPrefix = "speciesSelect"
        let validityTooltip = null
        if (hasNoVariants) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let customStyles = this.createCustomSelectStyles(hasNoVariants)
        const onChange = (speciesOption: any) => this.setSpecies(speciesOption)

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
            this.setVarietyById(option.value)
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
            this.setFormById(option.value)
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

        return this.state.varieties.map((pokemon: any) => {
            // default varieties derive name from their species
            let label = this.state.speciesOption.label

            let varietyNames = pokemon.displayNames
            if (varietyNames.length > 0) {
                // non-default varieties have their own name
                let matchingNames = varietyNames.filter((n: any) => n.language === "en")
                label = matchingNames[0].name
            }

            return {
                label: label,
                value: pokemon.pokemonId
            }
        })
    }

    // returns options for the form select
    createFormOptions() {
        if (!this.hasSecondaryForms()) {
            return []
        }

        return this.state.forms.map((form: any) => {
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
        })
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

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.state.varietyOption !== null
    }

    // returns true if the species has secondary varieties
    hasSecondaryVarieties() {
        return this.state.varieties.length >= 2
    }

    // returns true if the Pokemon has secondary forms
    hasSecondaryForms() {
        return this.state.forms.length >= 2
    }

    // returns true if the Pokemon should be marked as invalid
    shouldMarkPokemonInvalid() {
        if (this.state.varietyOption === null) {
            return false
        }

        if (this.state.speciesOption === null) {
            return false
        }

        let varietyValidity = this.getSelectedVariety().validity
        let speciesValidity = this.getSelectedSpecies().validity
        let pokemonIsValid = varietyValidity.includes(this.props.versionGroupId)
                          || speciesValidity.includes(this.props.versionGroupId)

        let shouldMarkInvalid = !this.props.ignoreValidity && !pokemonIsValid
        return shouldMarkInvalid
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
                formOption: null,
                varietyOption: null
            })

            this.fetchVarieties(newSpeciesOption.value)
            this.props.setSpecies(newSpeciesOption.value)
        }
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
     * Returns the data object for the selected variety.
     */
    getSelectedVariety() {
        let allVarieties = this.state.varieties
        let selectedVarietyId = this.state.varietyOption.value
        let matchingVarieties = allVarieties.filter((s: any) => s.pokemonId === selectedVarietyId)
        return matchingVarieties[0]
    }

    /**
     * Returns the data object for the selected Pokemon form.
     */
    getSelectedForm() {
        let allForms = this.state.forms
        let selectedFormId = this.state.formOption.value
        let matchingForms = allForms.filter((s: any) => s.pokemonId === selectedFormId)
        return matchingForms[0]
    }

    // set this selector to the given variety
    setVariety(variety: any) {
        // default varieties derive name from their species
        // TODO: get this from species data object
        let label = this.state.speciesOption.label

        let varietyNames = variety.displayNames
        if (varietyNames.length > 0) {
            // non-default varieties have their own name
            let matchingNames = varietyNames.filter(
                (n: any) => n.language === "en"
            )
            label = matchingNames[0].name
        }

        this.setState({
            varietyOption: {
                label: label,
                value: variety.pokemonId
            }
        })

        this.fetchForms(variety.pokemonId)
        this.props.setVariety(variety)
    }

    /**
     * Set this selector to the variety with the given Pokemon ID.
     */
    setVarietyById(pokemonId: number) {
        if (pokemonId !== this.state.varietyOption.value) {
            let variety = this.state.varieties.filter((p: any) => p.pokemonId === pokemonId)[0]
            this.setVariety(variety)
        }
    }

    /**
     * Set this selector to the first variety of the selected species.
     */
    setFirstVariety() {
        let variety = this.state.varieties[0]
        this.setVariety(variety)
    }

    /**
     * Set this selector to the given Pokemon form.
     */
    setForm(form: any) {
        // default forms derive name from their species
        let label = this.state.speciesOption.label

        let formNames = form.displayNames
        if (formNames.length > 0) {
            // non-default forms have their own name
            let matchingNames = formNames.filter((n: any) => n.language === "en")
            label = matchingNames[0].name
        }

        this.setState({
            formOption: {
                label: label,
                value: form.formId
            }
        })

        this.props.setForm(form)
    }

    /**
     * Set this selector to the Pokemon form with the given ID.
     */
    setFormById(formId: number) {
        if (formId !== this.state.formOption.value) {
            let form = this.state.forms.filter((f: any) => f.formId === formId)[0]
            this.setForm(form)
        }
    }

    /**
     * Set this selector to the first form of the selected variety.
     */
    setFirstForm() {
        let form = this.state.forms[0]
        this.setForm(form)
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
            forms: [],
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
            .then(varieties => this.setState({ varieties: varieties }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVarieties: false }))
            .then(() => this.setFirstVariety())
    }

    // fetches the forms from PokemonController
    async fetchForms(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching forms for Pokemon ${pokemonId}...`)

        this.setState({ loadingForms: true })

        // fetch forms
        await fetch(`${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/forms/${this.props.versionGroupId}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch forms for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(forms => this.setState({ forms: forms }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingForms: false }))
            .then(() => this.setFirstForm())
    }
}
