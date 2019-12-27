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
     * Whether species validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean,

    /**
     * Handler for setting the Pokemon in the parent component.
     */
    setPokemon: (id: number, validity: PokemonValidity) => void,

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
     * Value describing the Pokemon validity.
     */
    pokemonValidity: PokemonValidity,

    /**
     * Whether we're loading the Pokemon validity.
     */
    loadingPokemonValidity: boolean,

    /**
     * List of variants' IDs (variants are the Pokemon forms + species varieties).
     */
    variantIds: number[],

    /**
     * Whether we're loading the variants' IDs.
     */
    loadingVariantIds: boolean,

    /**
     * List of variants' names.
     */
    variantNames: string[],

    /**
     * Whether we're loading the variants' names.
     */
    loadingVariantNames: boolean,

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
            pokemonValidity: PokemonValidity.Invalid,
            loadingPokemonValidity: false,
            variantIds: [],
            loadingVariantIds: false,
            variantNames: [],
            loadingVariantNames: false,
            validityTooltipOpen: false
        }
    }

    componentDidUpdate(previousProps: PokemonSelectorProps) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let pokemonId = this.state.pokemonId
            if (pokemonId > 0) {
                this.fetchSpeciesValidity(pokemonId)
                    .then(() => {
                        this.fetchVariantIds(pokemonId)
                        this.fetchVariantNames(pokemonId)
                    })
                    .then(() => this.props.setPokemon(pokemonId, this.state.pokemonValidity))
            }
        }
    }

    render() {
        // sub-components
        let speciesSelect = this.renderSpeciesSelect()
        let variantSelect = this.renderVariantSelect()

        return (
            <div className="flex margin-bottom">
                {speciesSelect}
                {variantSelect}

                <Button
                    className="margin-right"
                    color="warning"
                    onMouseUp={() => this.setRandomSpecies()}>
                    Random
                </Button>

                <Button
                    className="margin-right"
                    color="danger"
                    onMouseUp={() => this.clearPokemon()}>
                    Clear
                </Button>
            </div>
        );
    }

    // returns a box for selecting a species
    renderSpeciesSelect() {
        let speciesOptions = this.createSpeciesOptions()

        // attach validity tooltip to variant select if the species has secondary forms
        let hasVariants = this.state.variantIds.length > 0
        let validityTooltip = this.renderValidityTooltip(hasVariants)

        // attach red border to species select if no variants are present
        let customStyles = this.createCustomSelectStyles(!hasVariants)

        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                isLoading={this.isLoading()}
                id={"speciesSelect" + this.props.index}
                styles={customStyles}
                placeholder="Select a species!"
                onChange={(e: any) => this.setPokemon(e.value)}
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
    renderVariantSelect() {
        let variantOptions = this.createVariantOptions()
        let hasVariants = variantOptions.length > 0
        let placeholder = hasVariants ? "Select a variant!" : "No variants"
        let customStyles = this.createCustomSelectStyles(hasVariants)

        let searchBox = (
            <Select
                blurInputOnSelect
                isLoading={this.isLoading()}
                isDisabled={!hasVariants}
                id={"variantSelect" + this.props.index}
                placeholder={placeholder}
                styles={customStyles}
                onChange={(e: any) => this.setPokemon(e.value)}
                options={variantOptions} />
        )

        return (
            <div className="margin-right">
                {searchBox}
            </div>
        )
    }

    // returns a tooltip indicating the validity of the Pokemon
    renderValidityTooltip(targetVariantsSelect: boolean) {
        if (!this.props.hideTooltips && this.shouldMarkPokemonInvalid()) {
            let targetPrefix = targetVariantsSelect ? "variantSelect" : "speciesSelect"
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

    // returns options for the variant select
    createVariantOptions() {
        // Pokemon with one form and one variety have no variants
        if (this.state.variantIds.length <= 2) {
            return []
        }

        return this.state.variantIds.map((id, index) => ({
            value: id,
            label: this.state.variantNames[index]
        }))
    }

    // returns a custom style for the species and variant selects
    createCustomSelectStyles(markAsInvalid: boolean) {
        return {
            control: (provided: any) => ({
                ...provided,
                minWidth: 230,
                border: markAsInvalid && this.shouldMarkPokemonInvalid() ? "1px solid #dc3545" : ""
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
        return this.state.loadingPokemonValidity
            || this.state.loadingVariantIds
            || this.state.loadingVariantNames
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.state.pokemonId > 0
    }

    // returns true if the Pokemon should be marked as invalid
    shouldMarkPokemonInvalid() {
        let checked = this.hasPokemon() && !this.isLoading()
        let shouldMarkInvalid = checked
                                && !this.props.ignoreValidity
                                    && this.state.pokemonValidity === PokemonValidity.Invalid

        return shouldMarkInvalid
    }

    // set to the species with the given ID
    setPokemon(pokemonId: number) {
        // only fetch if we need to
        if (pokemonId !== this.state.pokemonId) {
            this.setState({ pokemonId: pokemonId })

            this.fetchSpeciesValidity(pokemonId)
                .then(() => {
                    this.fetchVariantIds(pokemonId)
                    this.fetchVariantNames(pokemonId)
                })
                .then(() => this.props.setPokemon(pokemonId, this.state.pokemonValidity))
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
            pokemonValidity: PokemonValidity.Invalid
        })

        this.props.setPokemon(0, PokemonValidity.Invalid)
    }

    // fetches the validity of the species from PokemonController
    async fetchSpeciesValidity(speciesId: number) {
        if (speciesId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching validity for species ${speciesId}...`)

        this.setState({ loadingPokemonValidity: true })

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
                this.setState({ pokemonValidity: isValid ? PokemonValidity.Valid : PokemonValidity.Invalid })
            })
            .catch(error => {
                console.log(error)
                this.setState({ pokemonValidity: PokemonValidity.Invalid })
            })
            .then(() => this.setState({ loadingPokemonValidity: false }))
    }

    // fetches the variety IDs of the species from PokemonController
    async fetchVariantIds(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching variant IDs for species ${pokemonId}...`)

        this.setState({ loadingVariantIds: true })

        // fetch forms
        await fetch(`pokemon/${pokemonId}/variants/${this.props.versionGroupIndex}/ids`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch variant IDs for species ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(ids => this.setState({ variantIds: ids }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVariantIds: false }))
    }

    // fetches the names of the variants of the species from PokemonController
    async fetchVariantNames(pokemonId: number) {
        if (pokemonId <= 0) {
            return
        }

        console.log(`Selector ${this.props.index}: fetching variant names for species ${pokemonId}...`)

        this.setState({ loadingVariantNames: true })

        // fetch variants
        await fetch(`pokemon/${pokemonId}/variants/${this.props.versionGroupIndex}/names`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch variant names for species ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(names => this.setState({ variantNames: names }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingVariantNames: false }))
    }
}
