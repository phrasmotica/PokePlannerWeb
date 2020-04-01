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
    varieties: any[]

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
            selectedSpeciesOption = speciesOptions.filter((o: any) => o.value === speciesId)[0]
        }

        // attach validity tooltip and red border if necessary
        let idPrefix = "speciesSelect"
        let validityTooltip = null
        if (hasNoVariants) {
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let customStyles = this.createCustomSelectStyles(hasNoVariants)
        const onChange = (speciesOption: any) => {
            // cascades to set first variety and form
            this.setSpecies(speciesOption.value)
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
            selectedVarietyOption = varietyOptions.filter((o: any) => o.value === varietyId)[0]
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasVarieties ? "Select a variety!" : "No varieties"
        let customStyles = this.createCustomSelectStyles(hasVarieties)
        const onChange = (option: any) => {
            let varietyId = option.value
            this.setState({ varietyId: varietyId })

            let variety = this.getVariety(varietyId)
            this.props.setVariety(variety)

            // set first form
            let forms = this.getFormsOfVariety(varietyId)
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
            selectedFormOption = formOptions.filter((o: any) => o.value === formId)[0]
            validityTooltip = this.renderValidityTooltip(idPrefix)
        }

        let placeholder = hasForms ? "Select a form!" : "No forms"
        let customStyles = this.createCustomSelectStyles(hasForms)
        const onChange = (option: any) => {
            let formId = option.value
            this.setState({ formId: formId })

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

        // variety display names come from their forms
        if (this.state.formId === undefined) {
            return []
        }

        return this.state.varieties.map((variety: any) => {
            // default varieties derive name from their species
            let species = this.getSelectedSpecies()
            let speciesNames = species.displayNames.filter((n: any) => n.language === "en")
            let label = speciesNames[0].name

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
        })
    }

    // returns options for the form select
    createFormOptions() {
        if (!this.hasSecondaryForms()) {
            return []
        }

        let forms = this.getFormsOfSelectedVariety()
        return forms.map((form: any) => {
            // default varieties derive name from their species
            let species = this.getSelectedSpecies()
            let speciesNames = species.displayNames.filter((n: any) => n.language === "en")
            let label = speciesNames[0].name

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
        if (this.state.formId === undefined) {
            return false
        }

        if (this.state.speciesId === undefined) {
            return false
        }

        let speciesValidity = this.getSelectedSpecies().validity
        let pokemonIsValid = speciesValidity.includes(this.props.versionGroupId)

        let formValidity = this.getSelectedForm().validity
        if (formValidity.length > 0) {
            // can only obtain form if base species is obtainable
            pokemonIsValid &= formValidity.includes(this.props.versionGroupId)
        }

        return !this.props.ignoreValidity && !pokemonIsValid
    }

    /**
     * Set this selector to the species with the given ID.
     */
    setSpecies(newSpeciesId: number) {
        // only fetch if we need to
        let selectedSpeciesId = this.state.speciesId
        if (selectedSpeciesId === undefined || newSpeciesId !== selectedSpeciesId) {
            this.setState({
                speciesId: newSpeciesId,
                varietyId: undefined,
                varieties: [],
                formId: undefined,
                formsDict: []
            })

            this.props.setSpecies(newSpeciesId)
            this.fetchVarieties(newSpeciesId)
        }
    }

    /**
     * Sets the variety.
     */
    setVariety(variety: any) {
        this.setState({ varietyId: variety.pokemonId })
        this.props.setVariety(variety)
    }

    /**
     * Sets the form.
     */
    setForm(form: any) {
        this.setState({ formId: form.formId })
        this.props.setForm(form)
    }

    /**
     * Returns the data object for the selected species.
     */
    getSelectedSpecies() {
        let allSpecies = this.props.species
        let selectedSpeciesId = this.state.speciesId
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
        let selectedFormId = this.state.formId
        if (selectedFormId === undefined) {
            return null
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
            .then(varieties => {
                this.setState({ varieties: varieties })

                // set first variety
                let variety = varieties[0]
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
