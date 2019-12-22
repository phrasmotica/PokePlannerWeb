﻿import { Component } from "react"
import React from "react"
import { EfficacyList } from "./EfficacyList"
import { Spinner, Button, Row, Col, Input, Media, Collapse, Tooltip } from "reactstrap"
import { SpeciesValidity } from "../models/SpeciesValidity"

import "./PokemonSelector.scss"
import { TypeSet } from "../models/TypeSet"

export class PokemonSelector extends Component<{
    /**
     * The index of this Pokemon selector.
     */
    index: number,

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number,

    /**
     * The type set.
     */
    typeSet: TypeSet
}, {
    /**
     * The Pokemon species.
     */
    species: string,

    /**
     * Value describing the species validity.
     */
    speciesValidity: SpeciesValidity,

    /**
     * Whether we're loading the species validity.
     */
    loadingSpeciesIsValid: boolean,

    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean,

    /**
     * The Pokemon's name.
     */
    pokemonName: string,

    /**
     * Whether we're loading the Pokemon's name.
     */
    loadingPokemonName: boolean,

    /**
     * The URL of the Pokemon's sprite.
     */
    pokemonSpriteUrl: string,

    /**
     * Whether we're loading the URL of the Pokemon's sprite.
     */
    loadingPokemonSpriteUrl: boolean,

    /**
     * The Pokemon's types description.
     */
    pokemonTypesDescription: string,

    /**
     * Whether we're loading the Pokemon's types description.
     */
    loadingPokemonTypesDescription: boolean,

    /**
     * Whether to show the efficacy list.
     */
    showEfficacy: boolean
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            species: "",
            speciesValidity: SpeciesValidity.Nonexistent,
            loadingSpeciesIsValid: true,
            validityTooltipOpen: false,
            pokemonName: "",
            loadingPokemonName: true,
            pokemonSpriteUrl: "",
            loadingPokemonSpriteUrl: true,
            pokemonTypesDescription: '',
            loadingPokemonTypesDescription: true,
            showEfficacy: false
        }

        // bind stuff to this object
        this.handleSearch = this.handleSearch.bind(this)
        this.clearPokemon = this.clearPokemon.bind(this)
        this.toggleValidityTooltip = this.toggleValidityTooltip.bind(this)
        this.toggleShowEfficacy = this.toggleShowEfficacy.bind(this)
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loadingSpeciesIsValid: false,
            loadingPokemonName: false,
            loadingPokemonSpriteUrl: false,
            loadingPokemonTypesDescription: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh types description if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        if (versionGroupIndex !== previousVersionGroupIndex) {
            console.log(`Pokemon selector ${this.props.index}: version group index ${previousVersionGroupIndex} -> ${versionGroupIndex}`)
            let species = this.state.species
            if (species && species !== "") {
                this.fetchSpeciesIsValid(species)
                    .then(() => {
                        if (this.speciesIsValid()) {
                            // invalid might've become valid with the version group change, so we
                            // should fetch things that don't change between version groups
                            if (this.state.pokemonName === "") {
                                this.fetchPokemonName(species)
                            }

                            if (this.state.pokemonSpriteUrl === "") {
                                this.fetchSpriteUrl(species)
                            }

                            this.fetchTypesDescription(species)
                        }
                        else {
                            this.invalidatePokemon()
                        }
                    })
            }
        }
    }

    render() {
        return this.renderPokemon()
    }

    renderPokemon() {
        // flags
        let showEfficacy = this.state.showEfficacy

        // sub-components
        let searchBox = this.renderSearchBox()
        let pokemonInfo = this.renderPokemonInfo()
        let efficacyList = this.renderEfficacyList()

        return (
            <div>
                <Row>
                    {searchBox}
                    <Col xs="auto">
                        <Button color="danger" onMouseUp={this.clearPokemon}>Clear</Button>
                    </Col>
                </Row>
                {pokemonInfo}
                <Button
                    color="primary"
                    style={{ marginBottom: '1rem' }}
                    onClick={this.toggleShowEfficacy}>
                    {showEfficacy ? "Hide" : "Show"} efficacy
                </Button>
                <Collapse isOpen={showEfficacy}>
                    {efficacyList}
                </Collapse>
            </div>
        );
    }

    // returns whether this component is loading
    isLoading() {
        return this.state.loadingPokemonName
            || this.state.loadingPokemonSpriteUrl
            || this.state.loadingPokemonTypesDescription
    }

    // returns true if we have a species
    hasSpecies() {
        return this.state.species != null && this.state.species !== ""
    }

    // returns true if the species is valid
    speciesIsValid() {
        return this.state.speciesValidity === SpeciesValidity.Valid
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // returns a small loading spinner
    makeSmallSpinner() {
        return <Spinner animation="border" size="sm" />
    }

    // returns a box for searching for a species
    renderSearchBox() {
        let loadingValidity = this.state.loadingSpeciesIsValid
        let speciesCheckedAndInvalid = this.hasSpecies() && !loadingValidity && !this.speciesIsValid()

        let validityTooltip = null
        if (speciesCheckedAndInvalid) {
            // determine message from validity status
            let message = `${this.state.species} cannot be obtained in this game version!`
            if (this.state.speciesValidity === SpeciesValidity.Nonexistent) {
                message = `${this.state.species} does not exist!`
            }

            validityTooltip = (
                <Tooltip
                    isOpen={this.state.validityTooltipOpen}
                    toggle={this.toggleValidityTooltip}
                    placement="bottom"
                    target="speciesInput">
                    {message}
                </Tooltip>
            )
        }

        return (
            <Col xs="auto">
                <Input
                    type="text"
                    id="speciesInput"
                    placeholder="Search for a Pokemon!"
                    invalid={speciesCheckedAndInvalid}
                    onKeyDown={this.handleSearch} />
                {validityTooltip}
            </Col>
        )
    }

    // returns the Pokemon info
    renderPokemonInfo() {
        // flags
        let isLoading = this.isLoading()

        return (
            <Row>
                <Col xs="auto" className="sprite">
                    {isLoading
                        ? this.makeSpinner()
                        : <Media
                            object
                            src={this.state.pokemonSpriteUrl} />
                    }
                </Col>
                <Col xs="auto" style={{ padding: 10 }}>
                    <div>
                        {isLoading ? this.makeSmallSpinner() : this.state.pokemonName}
                    </div>
                    <div>
                        {isLoading ? this.makeSmallSpinner() : this.state.pokemonTypesDescription}
                    </div>
                </Col>
                <Col>

                </Col>
            </Row>
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        let species = this.state.species
        if (this.state.loadingSpeciesIsValid || !this.speciesIsValid()) {
            species = ""
        }

        return (
            <EfficacyList
                index={this.props.index}
                species={species}
                typeSet={this.props.typeSet}
                versionGroupIndex={this.props.versionGroupIndex} />
        )
    }

    // toggle the validity tooltip
    toggleValidityTooltip() {
        this.setState((previousState) => ({
            validityTooltipOpen: !previousState.validityTooltipOpen
        }))
    }

    // toggle the efficacy panel
    toggleShowEfficacy() {
        this.setState((previousState) => ({
            showEfficacy: !previousState.showEfficacy
        }))
    }

    // handler for searching for a Pokemon
    handleSearch(e: any) {
        // only fetch if we need to
        const newSpeciesName = e.target.value.toLowerCase()
        if (e.key === 'Enter' && newSpeciesName !== this.state.species) {
            // fetch name, sprite and types description
            this.fetchSpeciesIsValid(newSpeciesName)
                .then(() => {
                    if (this.speciesIsValid()) {
                        this.fetchPokemonName(newSpeciesName)
                        this.fetchSpriteUrl(newSpeciesName)
                        this.fetchTypesDescription(newSpeciesName)
                    }
                })
        }
    }

    // handler for clearing the Pokemon
    clearPokemon(_: any) {
        this.setState({
            species: "",
            speciesValidity: SpeciesValidity.Nonexistent,
            pokemonName: "",
            pokemonSpriteUrl: "",
            pokemonTypesDescription: ""
        })
    }

    // invalidate the Pokemon but don't clear the species
    invalidatePokemon() {
        this.setState({
            pokemonName: "",
            pokemonSpriteUrl: "",
            pokemonTypesDescription: ""
        })
    }

    // fetches the validity of the species
    async fetchSpeciesIsValid(species: string) {
        if (!species || species == "") {
            return
        }

        console.log(`Selector ${this.props.index}: fetching validity for '${species}'...`)

        this.setState({
            species: species,
            loadingSpeciesIsValid: true
        })

        // fetch validity
        await fetch(`pokemon/${species}/validity/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch validity for '${species}' but failed with status ${response.status}!`)
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
            .then(() => this.setState({ loadingSpeciesIsValid: false }))
    }

    // fetches the name for the given Pokemon species from PokemonController
    fetchPokemonName(species: string) {
        console.log(`Selector ${this.props.index}: fetching name for '${species}'...`)

        this.setState({ loadingPokemonName: true })

        // fetch name
        fetch(`pokemon/${species}/name`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch name for '${species}' but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(pokemonName => this.setState({ pokemonName: pokemonName }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonName: false }))
    }

    // fetches the sprite for the given Pokemon species from PokemonController
    fetchSpriteUrl(species: string) {
        console.log(`Selector ${this.props.index}: fetching sprite for '${species}'...`)

        this.setState({ loadingPokemonSpriteUrl: true })

        // fetch sprite URL
        fetch(`pokemon/${species}/sprite`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch sprite URL for '${species}' but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ pokemonSpriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonSpriteUrl: false }))
    }

    // fetches the types description for the given Pokemon from PokemonController
    fetchTypesDescription(species: string) {
        console.log(`Selector ${this.props.index}: fetching types description for '${species}'...`)

        this.setState({ loadingPokemonTypesDescription: true })

        // fetch types description
        fetch(`pokemon/${species}/types/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Selector ${this.props.index}: tried to fetch types description for '${species}' but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(typesDescription => this.setState({ pokemonTypesDescription: typesDescription }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonTypesDescription: false }))
    }
}
