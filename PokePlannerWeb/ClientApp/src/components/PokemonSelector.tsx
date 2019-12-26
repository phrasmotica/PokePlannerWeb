import React, { Component } from "react"
import { Button, Tooltip } from "reactstrap"
import Select from "react-select"
import { SpeciesValidity } from "../models/SpeciesValidity"

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
     * Whether species validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean,

    /**
     * Handler for setting the species in the parent component.
     */
    setSpecies: (id: number, validity: SpeciesValidity) => void,

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface PokemonSelectorState {
    /**
     * The species ID.
     */
    speciesId: number,

    /**
     * Value describing the species validity.
     */
    speciesValidity: SpeciesValidity,

    /**
     * Whether we're loading the species validity.
     */
    loadingSpeciesValidity: boolean,

    /**
     * List of species forms IDs.
     */
    formsIds: number[],

    /**
     * Whether we're loading the species forms IDs.
     */
    loadingFormsIds: boolean,

    /**
     * List of species forms names.
     */
    formsNames: string[],

    /**
     * Whether we're loading the species forms names.
     */
    loadingFormsNames: boolean,

    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean
}

/**
 * Component for selecting a Pokemon species.
 */
export class PokemonSelector extends Component<PokemonSelectorProps, PokemonSelectorState> {
    constructor(props: any) {
        super(props)
        this.state = {
            speciesId: 0,
            speciesValidity: SpeciesValidity.Invalid,
            loadingSpeciesValidity: false,
            formsIds: [],
            loadingFormsIds: false,
            formsNames: [],
            loadingFormsNames: false,
            validityTooltipOpen: false
        }
    }

    componentDidUpdate(previousProps: PokemonSelectorProps) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let speciesId = this.state.speciesId
            if (speciesId > 0) {
                this.fetchSpeciesValidity(speciesId)
                    .then(() => {
                        this.fetchSpeciesFormsIds(speciesId)
                        this.fetchSpeciesFormsNames(speciesId)
                    })
                    .then(() => this.props.setSpecies(speciesId, this.state.speciesValidity))
            }
        }
    }

    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()
        let formsSelect = this.renderFormsSelect()

        return (
            <div className="flex margin-bottom">
                {speciesSelect}
                {formsSelect}

                <Button
                    className="margin-right"
                    color="warning"
                    onMouseUp={() => this.setRandomSpecies()}>
                    Random
                </Button>

                <Button
                    className="margin-right"
                    color="danger"
                    onMouseUp={() => this.clearSpecies()}>
                    Clear
                </Button>
            </div>
        );
    }

    // returns a box for selecting a species
    renderSpeciesSelect() {
        let speciesOptions = this.createSpeciesOptions()

        // attach validity tooltip to the forms select if the species has secondary forms
        let hasForms = this.state.formsIds.length > 0
        let validityTooltip = this.renderValidityTooltip(hasForms)

        // attach red border to this select if no secondary forms are present
        let customStyles = this.createCustomSelectStyles(!hasForms)

        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                isLoading={this.isLoading()}
                id={"speciesSelect" + this.props.index}
                styles={customStyles}
                placeholder="Select a Pokemon!"
                onChange={(e: any) => this.setSpecies(e.value)}
                options={speciesOptions} />
        )

        return (
            <div className="margin-right">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns a box for selecting a form of the selected species
    renderFormsSelect() {
        let formOptions = this.createFormsOptions()
        let hasForms = formOptions.length > 0
        let placeholder = hasForms ? "Select a form!" : "No forms"
        let customStyles = this.createCustomSelectStyles(hasForms)

        let searchBox = (
            <Select
                blurInputOnSelect
                isLoading={this.isLoading()}
                isDisabled={!hasForms}
                id={"formsSelect" + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={(e: any) => this.setSpecies(e.value)}
                options={formOptions} />
        )

        return (
            <div className="margin-right">
                {searchBox}
            </div>
        )
    }

    // returns a tooltip indicating the validity of the species
    renderValidityTooltip(targetFormsSelect: boolean) {
        if (!this.props.hideTooltips && this.shouldMarkSpeciesInvalid()) {
            let targetPrefix = targetFormsSelect ? "formsSelect" : "speciesSelect"
            return (
                <Tooltip
                    isOpen={this.state.validityTooltipOpen}
                    toggle={() => this.toggleValidityTooltip()}
                    placement="bottom"
                    target={targetPrefix + this.props.index}>
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

    // returns options for the forms select
    createFormsOptions() {
        if (this.state.formsIds.length <= 1) {
            return []
        }

        return this.state.formsIds.map((id, index) => ({
            value: id,
            label: this.state.formsNames[index]
        }))
    }

    // returns a custom style for the species and form selects
    createCustomSelectStyles(markAsInvalid: boolean) {
        return {
            control: (provided: any) => ({
                ...provided,
                minWidth: 230,
                border: markAsInvalid && this.shouldMarkSpeciesInvalid() ? "1px solid #dc3545" : ""
            })
        }
    }

    // toggle the validity tooltip
    toggleValidityTooltip() {
        this.setState(previousState => ({
            validityTooltipOpen: !previousState.validityTooltipOpen
        }))
    }

    // returns whether this component is loading
    isLoading() {
        return this.state.loadingSpeciesValidity
            || this.state.loadingFormsIds
            || this.state.loadingFormsNames
    }

    // returns true if we have a species
    hasSpecies() {
        return this.state.speciesId > 0
    }

    // returns true if the species should be marked as invalid
    shouldMarkSpeciesInvalid() {
        let speciesChecked = this.hasSpecies() && !this.isLoading()
        let shouldMarkInvalid = speciesChecked
                                && !this.props.ignoreValidity
                                    && this.state.speciesValidity === SpeciesValidity.Invalid

        return shouldMarkInvalid
    }

    // set to the species with the given ID
    setSpecies(speciesId: number) {
        // only fetch if we need to
        if (speciesId !== this.state.speciesId) {
            this.setState({ speciesId: speciesId })

            this.fetchSpeciesValidity(speciesId)
                .then(() => {
                    this.fetchSpeciesFormsIds(speciesId)
                    this.fetchSpeciesFormsNames(speciesId)
                })
                .then(() => this.props.setSpecies(speciesId, this.state.speciesValidity))
        }
    }

    // set to a random species
    setRandomSpecies() {
        // ignore validity since we can't guarantee a valid species
        if (!this.props.ignoreValidity) {
            this.props.toggleIgnoreValidity()
        }

        let max = this.props.speciesNames.length
        let randomId = this.randomInt(0, max) + 1
        this.setSpecies(randomId)
    }

    // returns a random integer between the min (inclusive) and the max (exclusive)
    randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    // empty this selector
    clearSpecies() {
        this.setState({
            speciesId: 0,
            speciesValidity: SpeciesValidity.Invalid
        })

        this.props.setSpecies(0, SpeciesValidity.Invalid)
    }

    // fetches the validity of the species from PokemonController
    async fetchSpeciesValidity(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching validity for species ${speciesId}...`)

        this.setState({ loadingSpeciesValidity: true })

        // fetch validity
        await fetch(`pokemon/${speciesId}/validity/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch validity for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(validity => {
                let isValid = Boolean(validity)
                this.setState({ speciesValidity: isValid ? SpeciesValidity.Valid : SpeciesValidity.Invalid })
            })
            .catch(error => {
                console.log(error)
                this.setState({ speciesValidity: SpeciesValidity.Invalid })
            })
            .then(() => this.setState({ loadingSpeciesValidity: false }))
    }

    // fetches the IDs of the forms of the species from PokemonController
    async fetchSpeciesFormsIds(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching forms for species ${speciesId}...`)

        this.setState({ loadingFormsIds: true })

        // fetch forms
        await fetch(`pokemon/${speciesId}/forms/${this.props.versionGroupIndex}/ids`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch forms for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(ids => this.setState({ formsIds: ids }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingFormsIds: false }))
    }

    // fetches the names of the forms of the species from PokemonController
    async fetchSpeciesFormsNames(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching forms names for species ${speciesId}...`)

        this.setState({ loadingFormsNames: true })

        // fetch forms
        await fetch(`pokemon/${speciesId}/forms/${this.props.versionGroupIndex}/names`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch forms names for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(names => this.setState({ formsNames: names }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingFormsNames: false }))
    }
}
