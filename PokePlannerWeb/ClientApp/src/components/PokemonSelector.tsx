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
            speciesValidity: SpeciesValidity.Nonexistent,
            loadingSpeciesValidity: false,
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
                    .then(() => this.props.setSpecies(speciesId, this.state.speciesValidity))
            }
        }
    }

    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()

        return (
            <div className="flex margin-bottom">
                {speciesSelect}

                <Button
                    className="margin-right"
                    color="primary"
                    disabled={this.state.speciesId <= 1}
                    onMouseUp={() => this.setPreviousSpecies()}>
                    Previous
                </Button>

                <Button
                    className="margin-right"
                    color="primary"
                    disabled={!this.hasSpecies() || this.hasLastSpecies()}
                    onMouseUp={() => this.setNextSpecies()}>
                    Next
                </Button>

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
        let validityTooltip = this.renderValidityTooltip()

        let options = this.props.speciesNames.map((name, index) => ({ value: index + 1, label: name }))
        let customStyles = {
            control: (provided: any) => ({
                ...provided,
                minWidth: 230,
                border: this.shouldMarkSpeciesInvalid() ? "1px solid #dc3545" : ""
            })
        }

        let searchBox = (
            <Select
                isSearchable
                isLoading={this.isLoading()}
                id={"speciesInput" + this.props.index}
                styles={customStyles}
                placeholder="Select a Pokemon!"
                onChange={(e: any) => this.setSpecies(e.value)}
                options={options} />
        )

        return (
            <div className="margin-right">
                {searchBox}
                {validityTooltip}
            </div>
        )
    }

    // returns a tooltip indicating the validity of the species
    renderValidityTooltip() {
        if (!this.props.hideTooltips && this.shouldMarkSpeciesInvalid()) {
            // determine message from validity status
            let message = `Cannot be obtained in this game version!`
            if (this.state.speciesValidity === SpeciesValidity.Nonexistent) {
                message = `Does not exist!`
            }

            return (
                <Tooltip
                    isOpen={this.state.validityTooltipOpen}
                    toggle={() => this.toggleValidityTooltip()}
                    placement="bottom"
                    target={"speciesInput" + this.props.index}>
                    {message}
                </Tooltip>
            )
        }

        return null
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
    }

    // returns true if we have a species
    hasSpecies() {
        return this.state.speciesId > 0
    }

    // returns true if we are set to the last species
    hasLastSpecies() {
        return this.state.speciesId >= this.props.speciesNames.length
    }

    // returns true if the species should be marked as invalid
    shouldMarkSpeciesInvalid() {
        let speciesChecked = this.hasSpecies() && !this.isLoading()
        let speciesValidity = this.state.speciesValidity
        let shouldMarkInvalid = speciesChecked
                                && (speciesValidity === SpeciesValidity.Nonexistent
                                    || (!this.props.ignoreValidity && speciesValidity === SpeciesValidity.Invalid))

        return shouldMarkInvalid
    }

    // set to the species with the given ID
    setSpecies(speciesId: number) {
        // only fetch if we need to
        if (speciesId !== this.state.speciesId) {
            this.setState({ speciesId: speciesId })

            this.fetchSpeciesValidity(speciesId)
                .then(() => this.props.setSpecies(speciesId, this.state.speciesValidity))
        }
    }

    // set to the previous species
    setPreviousSpecies() {
        this.setSpecies(Math.max(1, this.state.speciesId - 1))
    }

    // set to the next species
    setNextSpecies() {
        this.setSpecies(Math.min(this.state.speciesId + 1, this.props.speciesNames.length))
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
            speciesValidity: SpeciesValidity.Nonexistent
        })

        this.props.setSpecies(0, SpeciesValidity.Nonexistent)
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
                this.setState({ speciesValidity: SpeciesValidity.Nonexistent })
            })
            .then(() => this.setState({ loadingSpeciesValidity: false }))
    }
}
