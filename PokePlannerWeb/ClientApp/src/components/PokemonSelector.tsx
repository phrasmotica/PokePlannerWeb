import { Component } from "react";
import React from "react";
import { EfficacyList } from "./EfficacyList";

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
    speciesName: string,

    /**
     * The Pokemon to display.
     */
    pokemon: any,

    /**
     * The types description to display.
     */
    typesDescription: string,

    /**
     * Whether we're loading the selected Pokemon.
     */
    loading: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            speciesName: '',
            pokemon: {},
            typesDescription: '',
            loading: true
        }

        // bind event handlers to this object
        this.handleSearch = this.handleSearch.bind(this)
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loading: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh types description if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        if (versionGroupIndex !== previousVersionGroupIndex) {
            console.log(`Pokemon selector ${this.props.index}: version group index ${previousVersionGroupIndex} -> ${versionGroupIndex}`)
            let species = this.state.speciesName
            if (species && species !== "") {
                this.getTypesDescription(species)
            }
        }
    }

    // handler for searching for a Pokemon
    handleSearch(e: any) {
        // only update if we need to
        const newSpeciesName = e.target.value.toLowerCase()
        if (e.key === 'Enter' && newSpeciesName !== this.state.pokemon.name) {
            // get Pokemon payload
            this.findPokemon(newSpeciesName)

            // get types description
            this.getTypesDescription(newSpeciesName)
        }
    }

    renderPokemon(pokemon: any) {
        // display message if we're loading
        let species = this.state.speciesName
        let loadingElement = this.state.loading ? <p><em>Loading {species}...</em></p> : null

        return (
            <tr key={pokemon.id}>
                <td>
                    <input type="text" onKeyDown={this.handleSearch} />
                    {loadingElement}
                </td>
                <td>{pokemon.order}</td>
                <td>
                    <img src={pokemon.spriteUrl} alt={pokemon.englishName} style={{ width: 60, height: 60 }} />
                </td>
                <td>{pokemon.englishName}</td>
                <td>{this.state.typesDescription}</td>
                <td>
                    <EfficacyList index={this.props.index} species={species} />
                </td>
            </tr>
        );
    }

    render() {
        return this.renderPokemon(this.state.pokemon)
    }

    // retrieves the given Pokemon species from PokemonController
    async findPokemon(species: string) {
        // loading begins
        this.setState({
            speciesName: species,
            loading: true
        })

        // get Pokemon data
        console.log(`Pokemon selector ${this.props.index}: getting species '${species}'...`)
        const response = await fetch(`pokemon/${species}`)

        if (response.status === 200) {
            // get JSON payload
            const newPokemon = await response.json()
            console.log(`Pokemon selector ${this.props.index}: got species '${species}'`)

            // set new Pokemon and update species name
            this.setState({
                pokemon: newPokemon
            })
        }
        else if (response.status === 500) {
            // species endpoint couldn't be found
            console.log(`Pokemon selector ${this.props.index}: couldn't get species '${species}'!`)
            console.log(`(if '${species}' looks valid, PokeAPI might be down!)`)
            console.log(response)
        }
        else {
            // some other error
            console.log(`Pokemon selector ${this.props.index}: tried to get species '${species}' but failed with status ${response.status}!`)
            console.log("(ya boi needs to add some logic to handle this...)")
            console.log(response)
        }

        // finished loading
        this.setState({
            loading: false
        })
    }

    // gets the types description
    getTypesDescription(species: string) {
        console.log(`Pokemon selector ${this.props.index}: getting types description for ${species}...`)
        fetch(`pokemon/${species}/types/${this.props.versionGroupIndex}`)
            .then((response) => response.text())
            .then((typesDescription => this.setState({ typesDescription: typesDescription })))
    }
}