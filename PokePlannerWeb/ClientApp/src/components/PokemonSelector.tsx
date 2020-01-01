import React, { Component } from "react"
import { Button, Tooltip } from "reactstrap"
import Select from "react-select"
import { PokemonValidity } from "../models/PokemonValidity"

import "../styles/types.scss"
import "./TeamBuilder.scss"

interface PokemonSelectorProps {
    /**
     * The index of this Pokemon selector.
     */
    index: number,

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number,

    /**
     * List of Pokemon species names.
     */
    speciesNames: string[],

    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean,

    /**
     * Handler for setting the Pokemon in the parent component.
     */
    setPokemon: (pokemonId: number, validity: PokemonValidity) => void,

    /**
     * Handler for clearing the Pokemon in the parent component.
     */
    clearPokemon: () => void,

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (formId: number) => void,

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface PokemonSelectorState {
    /**
     * The Pokemon ID.
     */
    pokemonId: number,

    /**
     * The option of the species.
     */
    speciesOption: any,

    /**
     * The ID of the Pokemon form.
     */
    formId: number,

    /**
     * The option of the Pokemon form.
     */
    formOption: any,

    /**
     * The option of the species variety.
     */
    varietyOption: any,

    /**
     * Value describing the Pokemon validity.
     */
    pokemonValidity: PokemonValidity,

    /**
     * Whether we're loading the Pokemon validity.
     */
    loadingPokemonValidity: boolean,

    /**
     * List of forms' IDs.
     */
    formIds: number[],

    /**
     * Whether we're loading the forms' IDs.
     */
    loadingFormIds: boolean,

    /**
     * List of forms' names.
     */
    formNames: string[],

    /**
     * Whether we're loading the forms' names.
     */
    loadingFormNames: boolean,

    /**
     * List of varieties' IDs.
     */
    varietyIds: number[],

    /**
     * Whether we're loading the varieties' IDs.
     */
    loadingVarietyIds: boolean,

    /**
     * List of varieties' names.
     */
    varietyNames: string[],

    /**
     * Whether we're loading the varieties' names.
     */
    loadingVarietyNames: boolean,

    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean
}

/**
 * Component for selecting a Pokemon.
 */
export class PokemonSelector extends Component<PokemonSelectorProps, PokemonSelectorState> {
    constructor(props: any) {
        super(props)
        this.state = {
            pokemonId: 0,
            speciesOption: null,
            formId: 0,
            formOption: null,
            varietyOption: null,
            pokemonValidity: PokemonValidity.Invalid,
            loadingPokemonValidity: false,
            formIds: [],
            loadingFormIds: false,
            formNames: [],
            loadingFormNames: false,
            varietyIds: [],
            loadingVarietyIds: false,
            varietyNames: [],
            loadingVarietyNames: false,
            validityTooltipOpen: false
        }
    }

    componentDidUpdate(previousProps: PokemonSelectorProps) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let pokemonId = this.state.formId
            if (pokemonId > 0) {
                this.fetchPokemonValidity(pokemonId)
                    .then(() => {
                        this.props.setPokemon(pokemonId, this.state.pokemonValidity)
                        this.fetchFormIds(pokemonId)
                        this.fetchFormNames(pokemonId)
                        this.fetchVarietyIds(pokemonId)
                        this.fetchVarietyNames(pokemonId)
                    })
            }
        }
    }

    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()
        let formSelect = this.renderFormSelect()
        let varietySelect = this.renderVarietySelect()

        return (
            <div className="margin-right">
                {speciesSelect}
                {formSelect}
                {varietySelect}

                <div className="flex-end margin-bottom-small">
                    <Button
                        color="warning"
                        onMouseUp={() => this.setRandomPokemon()}>
                        Random
                    </Button>
                </div>

                <div className="flex-end margin-bottom-small">
                    <Button
                        color="danger"
                        onMouseUp={() => this.clearPokemon()}>
                        Clear
                    </Button>
                </div>
            </div>
        );
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
        const onChange = (option: any) => {
            this.setState({ speciesOption: option })
            this.setPokemon(option.value)
        }

        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={this.isLoadingPokemonValidity()}
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
            this.setForm(option.value)
        }

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.isLoadingPokemonForms()}
                isDisabled={!hasForms}
                id={idPrefix + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={onChange}
                value={this.state.formOption}
                options={formOptions} />
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
            this.setVariety(option.value)
        }

        let searchBox = (
            <Select
                blurInputOnSelect
                width="230px"
                isLoading={this.isLoadingSpeciesVarieties()}
                isDisabled={!hasVarieties}
                id={idPrefix + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={onChange}
                value={this.state.varietyOption}
                options={varietyOptions} />
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
        return this.props.speciesNames.map((name, index) => ({
            value: index + 1,
            label: name
        }))
    }

    // returns options for the form select
    createFormOptions() {
        if (!this.hasSecondaryForms()) {
            return []
        }

        return this.state.formIds.map((id, index) => ({
            value: id,
            label: this.state.formNames[index]
        }))
    }

    // returns options for the variety select
    createVarietyOptions() {
        if (!this.hasSecondaryVarieties()) {
            return []
        }

        return this.state.varietyIds.map((id, index) => ({
            value: id,
            label: this.state.varietyNames[index]
        }))
    }

    // returns a custom style for the select boxes
    createCustomSelectStyles(markAsInvalid: boolean) {
        return {
            container: (provided: any, state: any) => ({
                ...provided,
                maxWidth: state.selectProps.width,
                marginLeft: "auto"
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                maxWidth: state.selectProps.width,
                border: markAsInvalid && this.shouldMarkPokemonInvalid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                maxWidth: state.selectProps.width
            })
        }
    }

    // toggle the validity tooltip
    toggleValidityTooltip() {
        this.setState(previousState => ({
            validityTooltipOpen: !previousState.validityTooltipOpen
        }))
    }

    // returns whether the Pokemon validity is loading
    isLoadingPokemonValidity() {
        return this.state.loadingPokemonValidity
    }

    // returns whether the Pokemon forms are loading
    isLoadingPokemonForms() {
        return this.state.loadingFormIds
            || this.state.loadingFormNames
    }

    // returns whether the species varieties are loading
    isLoadingSpeciesVarieties() {
        return this.state.loadingVarietyIds
            || this.state.loadingVarietyNames
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.state.pokemonId > 0
    }

    // returns true if the Pokemon has secondary forms
    hasSecondaryForms() {
        let numIds = this.state.formIds.length
        let numNames = this.state.formNames.length
        return numIds === numNames && numIds >= 2 && numNames >= 2
    }

    // returns true if the species has secondary varieties
    hasSecondaryVarieties() {
        let numIds = this.state.varietyIds.length
        let numNames = this.state.varietyNames.length
        return numIds === numNames && numIds >= 2 && numNames >= 2
    }

    // returns true if the Pokemon should be marked as invalid
    shouldMarkPokemonInvalid() {
        let checked = this.hasPokemon() && !this.isLoadingPokemonValidity()
        let shouldMarkInvalid = checked
                                && !this.props.ignoreValidity
                                    && this.state.pokemonValidity === PokemonValidity.Invalid

        return shouldMarkInvalid
    }

    // set this selector to the Pokemon with the given ID
    setPokemon(pokemonId: number) {
        // only fetch if we need to
        if (pokemonId !== this.state.pokemonId) {
            this.setState({
                pokemonId: pokemonId,
                formId: 0,
                formOption: null,
                varietyOption: null
            })

            this.fetchPokemonValidity(pokemonId)
                .then(() => this.props.setPokemon(pokemonId, this.state.pokemonValidity))

            this.fetchFormIds(pokemonId)
                .then(() => this.fetchFormNames(pokemonId))
                .then(() => {
                    if (this.hasSecondaryForms()) {
                        let firstOption = {
                            value: this.state.formIds[0],
                            label: this.state.formNames[0]
                        }
                        console.log(firstOption)
                        this.setState({ formOption: firstOption })
                    }
                })

            this.fetchVarietyIds(pokemonId)
                .then(() => this.fetchVarietyNames(pokemonId))
                .then(() => {
                    if (this.hasSecondaryVarieties()) {
                        let firstOption = {
                            value: this.state.varietyIds[0],
                            label: this.state.varietyNames[0]
                        }
                        console.log(firstOption)
                        this.setState({ varietyOption: firstOption })
                    }
                })
        }
    }

    // set this selector to the Pokemon form with the given ID
    setForm(formId: number) {
        if (formId !== this.state.formId) {
            this.setState({ formId: formId })
            this.props.setForm(formId)
        }
    }

    // set this selector to the variety with the given Pokemon ID
    setVariety(pokemonId: number) {
        if (pokemonId !== this.state.pokemonId) {
            this.setState({
                pokemonId: pokemonId,
                formId: 0,
                formOption: null
            })

            // varieties introduced in later games will not be valid
            this.fetchPokemonValidity(pokemonId)
                .then(() => this.props.setPokemon(pokemonId, this.state.pokemonValidity))
        }
    }

    // set this selector to a random Pokemon
    setRandomPokemon() {
        // ignore validity since we can't guarantee a valid Pokemon
        if (!this.props.ignoreValidity) {
            this.props.toggleIgnoreValidity()
        }

        let max = this.props.speciesNames.length
        let randomId = this.randomInt(0, max) + 1
        let speciesOption = {
            value: randomId,
            label: this.props.speciesNames[randomId - 1]
        }

        this.setState({ speciesOption: speciesOption })
        this.setPokemon(randomId)
    }

    // returns a random integer between the min (inclusive) and the max (exclusive)
    randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    // empty this selector
    clearPokemon() {
        this.setState({
            pokemonId: 0,
            speciesOption: null,
            formId: 0,
            formIds: [],
            formNames: [],
            formOption: null,
            varietyIds: [],
            varietyNames: [],
            varietyOption: null,
            pokemonValidity: PokemonValidity.Invalid
        })

        this.props.clearPokemon()
    }

    // fetches the validity of the Pokemon from PokemonController
    async fetchPokemonValidity(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching validity for Pokemon ${pokemonId}...`)

        this.setState({ loadingPokemonValidity: true })

        // fetch validity
        await fetch(`pokemon/${pokemonId}/validity/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch validity for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(validity => {
                let isValid = Boolean(validity)
                this.setState({ pokemonValidity: isValid ? PokemonValidity.Valid : PokemonValidity.Invalid })
            })
            .catch(error => {
                console.log(error)
                this.setState({ pokemonValidity: PokemonValidity.Invalid })
            })
            .then(() => this.setState({ loadingPokemonValidity: false }))
    }

    // fetches the forms' IDs from PokemonController
    async fetchFormIds(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching form IDs for Pokemon ${pokemonId}...`)

        this.setState({ loadingFormIds: true })

        // fetch IDs
        await fetch(`pokemon/${pokemonId}/forms/${this.props.versionGroupIndex}/ids`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch form IDs for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(ids => this.setState({ formIds: ids }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingFormIds: false }))
    }

    // fetches the forms' names from PokemonController
    async fetchFormNames(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching form names for Pokemon ${pokemonId}...`)

        this.setState({ loadingFormNames: true })

        // fetch names
        await fetch(`pokemon/${pokemonId}/forms/${this.props.versionGroupIndex}/names`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch form names for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(names => this.setState({ formNames: names }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingFormNames: false }))
    }

    // fetches the species varieties' IDs from PokemonController
    async fetchVarietyIds(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching variety IDs for species ${speciesId}...`)

        this.setState({ loadingVarietyIds: true })

        // fetch IDs
        await fetch(`species/${speciesId}/varieties/${this.props.versionGroupIndex}/ids`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch variety IDs for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(ids => this.setState({ varietyIds: ids }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVarietyIds: false }))
    }

    // fetches the species varieties' names from PokemonController
    async fetchVarietyNames(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching variety names for species ${speciesId}...`)

        this.setState({ loadingVarietyNames: true })

        // fetch names
        await fetch(`species/${speciesId}/varieties/${this.props.versionGroupIndex}/names`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch variety names for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(names => this.setState({ varietyNames: names }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVarietyNames: false }))
    }
}
