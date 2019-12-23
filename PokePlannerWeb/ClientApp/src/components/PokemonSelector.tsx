import React, { Component } from "react"
import { Spinner, Button, Row, Col, Input, Media, Collapse, Tooltip } from "reactstrap"
import { EfficacyList } from "./EfficacyList"
import { SpeciesValidity } from "../models/SpeciesValidity"
import { TypeSet } from "../models/TypeSet"

import "./PokemonSelector.scss"

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
     * Whether species validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * The type set.
     */
    typeSet: TypeSet,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
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
    loadingSpeciesValidity: boolean,

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
            loadingSpeciesValidity: true,
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
            loadingSpeciesValidity: false,
            loadingPokemonName: false,
            loadingPokemonSpriteUrl: false,
            loadingPokemonTypesDescription: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let species = this.state.species
            if (species && species !== "") {
                this.fetchSpeciesIsValid(species)
                    .then(() => this.fetchTypesDescription(species))
            }
        }
    }

    render() {
        return this.renderPokemon()
    }

    // returns the whole component
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

    // returns a box for searching for a species
    renderSearchBox() {
        let validityTooltip = null
        let shouldMarkInvalidSpecies = this.shouldMarkSpeciesInvalid()
        if (!this.props.hideTooltips && shouldMarkInvalidSpecies) {
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
                    target={"speciesInput" + this.props.index}>
                    {message}
                </Tooltip>
            )
        }

        return (
            <Col xs="auto">
                <Input
                    type="text"
                    id={"speciesInput" + this.props.index}
                    placeholder="Search for a Pokemon!"
                    invalid={shouldMarkInvalidSpecies}
                    onKeyDown={this.handleSearch} />
                {validityTooltip}
            </Col>
        )
    }

    // returns the Pokemon info
    renderPokemonInfo() {
        // don't show loading spinners if we shouldn't show the species
        let shouldShowSpecies = this.shouldShowSpecies()
        let isLoading = shouldShowSpecies && this.isLoading()

        let className = shouldShowSpecies ? "" : "hidden"
        return (
            <Row>
                <Col xs="auto" className="sprite">
                    {isLoading
                        ? this.makeSpinner()
                        : <Media
                            object
                            className={className}
                            src={this.state.pokemonSpriteUrl} />
                    }
                </Col>
                <Col xs="auto" style={{ padding: 10 }}>
                    <div className={className}>
                        {isLoading ? this.makeSmallSpinner() : this.state.pokemonName}
                    </div>
                    <div className={className}>
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
        return (
            <EfficacyList
                index={this.props.index}
                species={this.state.species}
                typeSet={this.props.typeSet}
                versionGroupIndex={this.props.versionGroupIndex}
                loadingSpeciesValidity={this.state.loadingSpeciesValidity}
                showMultipliers={this.shouldShowSpecies()} />
        )
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // returns a small loading spinner
    makeSmallSpinner() {
        return <Spinner animation="border" size="sm" />
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

    // returns true if the species should be displayed
    shouldShowSpecies() {
        let shouldShowInvalidSpecies = this.props.ignoreValidity
                                    && this.hasSpecies()
                                    && this.state.speciesValidity !== SpeciesValidity.Nonexistent
        return shouldShowInvalidSpecies || this.speciesIsValid()
    }

    // returns true if the species should be marked as invalid
    shouldMarkSpeciesInvalid() {
        let speciesChecked = this.hasSpecies() && !this.state.loadingSpeciesValidity
        let speciesValidity = this.state.speciesValidity
        let shouldMarkInvalid = speciesChecked
                               && (speciesValidity === SpeciesValidity.Nonexistent
                                    || (!this.props.ignoreValidity && speciesValidity === SpeciesValidity.Invalid))

        return shouldMarkInvalid
    }

    // handler for searching for a Pokemon
    handleSearch(e: any) {
        // only fetch if we need to
        const newSpeciesName = e.target.value.toLowerCase()
        if (e.key === 'Enter' && newSpeciesName !== this.state.species) {
            // fetch name, sprite and types description
            this.fetchSpeciesIsValid(newSpeciesName)
                .then(() => {
                    if (this.state.speciesValidity !== SpeciesValidity.Nonexistent) {
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

    // fetches the validity of the species from PokemonController
    async fetchSpeciesIsValid(species: string) {
        if (species == null || species == "") {
            return
        }

        console.log(`Selector ${this.props.index}: fetching validity for '${species}'...`)

        this.setState({
            species: species,
            loadingSpeciesValidity: true
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
            .then(() => this.setState({ loadingSpeciesValidity: false }))
    }

    // fetches the name of the species from PokemonController
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

    // fetches the sprite of the species from PokemonController
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

    // fetches the types description for the species from PokemonController
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
