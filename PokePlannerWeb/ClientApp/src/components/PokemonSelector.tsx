import { Component } from "react";
import React from "react";
import { EfficacyList } from "./EfficacyList";
import { Spinner } from "reactstrap";

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
}, {
    /**
     * The names of Pokemon species entered into the input field.
     */
    species: string,

    /**
     * The Pokemon to display.
     */
    pokemon: any,

    /**
     * Whether we're loading the selected Pokemon.
     */
    loadingPokemon: boolean,

    /**
     * The types description to display.
     */
    typesDescription: string,

    /**
     * Whether we're loading the types description.
     */
    loadingTypesDescription: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            species: '',
            pokemon: {},
            loadingPokemon: true,
            typesDescription: '',
            loadingTypesDescription: true
        }

        // bind stuff to this object
        this.handleSearch = this.handleSearch.bind(this)
        this.handleResponse = this.handleResponse.bind(this)
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loadingPokemon: false,
            loadingTypesDescription: false
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
                this.getTypesDescription(species)
            }
        }
    }

    render() {
        return this.renderPokemon(this.state.pokemon)
    }

    renderPokemon(pokemon: any) {
        // display message if we're loading
        let species = this.state.species
        let isLoading = this.isLoading()

        let primaryTypeStr = "unknown"
        if (pokemon.primaryType) {
            primaryTypeStr = pokemon.primaryType.toLowerCase()
        }

        let secondaryTypeStr = null
        if (pokemon.secondaryType) {
            secondaryTypeStr = pokemon.secondaryType.toLowerCase()
        }

        return (
            <tr key={pokemon.id}>
                <td>
                    <input type="text" onKeyDown={this.handleSearch} />
                </td>
                <td>{isLoading ? this.makeSpinner() : pokemon.order}</td>
                <td>
                    {isLoading
                        ? this.makeSpinner()
                        : <img src={pokemon.spriteUrl} alt={pokemon.englishName} style={{ width: 60, height: 60 }} />
                    }
                </td>
                <td>{isLoading ? this.makeSpinner() : pokemon.englishName}</td>
                <td>
                    {this.state.loadingTypesDescription ? this.makeSpinner() : this.state.typesDescription}
                </td>
                <td>
                    <EfficacyList index={this.props.index} species={species} versionGroupIndex={this.props.versionGroupIndex} />
                </td>
            </tr>
        );
    }

    // returns whether this component is loading
    isLoading() {
        return this.state.loadingPokemon
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // handler for searching for a Pokemon
    handleSearch(e: any) {
        // only update if we need to
        const newSpeciesName = e.target.value.toLowerCase()
        if (e.key === 'Enter' && newSpeciesName !== this.state.pokemon.name) {
            // get Pokemon payload
            this.getPokemon(newSpeciesName)

            // get types description
            this.getTypesDescription(newSpeciesName)
        }
    }

    // retrieves the given Pokemon species from PokemonController
    getPokemon(species: string) {
        console.log(`Pokemon selector ${this.props.index}: getting species '${species}'...`)

        // loading begins
        this.setState({
            species: species,
            loadingPokemon: true
        })

        // get Pokemon data
        fetch(`pokemon/${species}`)
            .then(this.handleResponse)
            .then(response => response.json())
            .then(newPokemon => this.setState({ pokemon: newPokemon }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemon: false }))
    }

    // retrieves the Pokemon's types description from PokemonController
    getTypesDescription(species: string) {
        console.log(`Pokemon selector ${this.props.index}: getting types description for ${species}...`)

        // loading begins
        this.setState({
            loadingTypesDescription: true
        })

        fetch(`pokemon/${species}/types/${this.props.versionGroupIndex}`)
            .then(this.handleResponse)
            .then(response => response.text())
            .then(typesDescription => this.setState({ typesDescription: typesDescription }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypesDescription: false }))
    }

    // handle PokeAPI responses
    handleResponse(response: Response) {
        if (response.status === 200) {
            return response
        }

        let species = this.state.species
        if (response.status === 500) {
            // species endpoint couldn't be found
            throw new Error(`Pokemon selector ${this.props.index}: couldn't get species '${species}'!`)
        }

        // some other error
        throw new Error(`Pokemon selector ${this.props.index}: tried to get species '${species}' but failed with status ${response.status}!`)
    }
}