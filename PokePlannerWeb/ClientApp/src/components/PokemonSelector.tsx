import { Component } from "react"
import React from "react"
import { EfficacyList } from "./EfficacyList"
import { Spinner, Button, Row, Col, Input, Media, Container, Collapse } from "reactstrap"

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
        this.toggleShowEfficacy = this.toggleShowEfficacy.bind(this)
    }

    componentDidMount() {
        // finished loading
        this.setState({
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
                this.fetchTypesDescription(species)
            }
        }
    }

    render() {
        return this.renderPokemon()
    }

    renderPokemon() {
        // flags
        let isLoading = this.isLoading()
        let showEfficacy = this.state.showEfficacy

        // sub-components
        let pokemonInfo = this.renderPokemonInfo()
        let efficacyList = this.renderEfficacyList()

        return (
            <Container>
                <Row style={{ height: 60 }}>
                    <Col xs="auto" className="flex-center">
                        <Button color="danger" onMouseUp={this.clearPokemon}>Clear</Button>
                    </Col>
                    <Col xs="auto" className="flex-center">
                        <Button color="primary" onClick={this.toggleShowEfficacy}>{showEfficacy ? "Hide" : "Show"} efficacy</Button>
                    </Col>
                    <Col xs="auto" className="flex-center">
                        <Input
                            type="search"
                            placeholder="Search for a Pokemon!"
                            onKeyDown={this.handleSearch} />
                    </Col>
                    <Col xs="auto" className="flex-center">
                        {isLoading ? this.makeSpinner() : this.state.pokemonName}
                    </Col>
                    <Col xs="auto" className="flex-center">
                        {isLoading ? this.makeSpinner() : this.state.pokemonTypesDescription}
                    </Col>
                </Row>
                <Row>
                    {pokemonInfo}
                </Row>
                <Collapse isOpen={showEfficacy}>
                    {efficacyList}
                </Collapse>
            </Container>
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
        return this.state.species && this.state.species !== ""
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // returns the Pokemon info
    renderPokemonInfo() {
        // flags
        let isLoading = this.isLoading()
        let hideSpecies = !this.hasSpecies()

        return (
            <Container>
                <Col className="sprite">
                    {isLoading
                        ? this.makeSpinner()
                        : <Media
                            object
                            src={this.state.pokemonSpriteUrl}
                            hidden={hideSpecies} />
                    }
                </Col>
                <Col>

                </Col>
                <Col>

                </Col>
            </Container>
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        return (
            <EfficacyList
                index={this.props.index}
                species={this.state.species}
                typeSet={this.props.typeSet}
                versionGroupIndex={this.props.versionGroupIndex} />
        )
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
            this.fetchPokemonName(newSpeciesName)
            this.fetchSpriteUrl(newSpeciesName)
            this.fetchTypesDescription(newSpeciesName)
        }
    }

    // handler for clearing the Pokemon
    clearPokemon(_: any) {
        this.setState({
            species: "",
            pokemonName: "",
            pokemonSpriteUrl: "",
            pokemonTypesDescription: ""
        })
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
            .then(pokemonName => this.setState({
                species: species,
                pokemonName: pokemonName
            }))
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
