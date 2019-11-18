import { Component } from "react";
import React from "react";

export class PokemonSelector extends Component<{
    /**
     * The index of this Pokemon selector.
     */
    index: number,
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
     * Whether we're loading the selected Pokemon.
     */
    loading: boolean
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            speciesName: '',
            pokemon: {},
            loading: true
        }

        // bind event handlers to this object
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this.findPokemon = this.findPokemon.bind(this)
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loading: false
        })
    }

    renderPokemon(pokemon: any) {
        // display message if we're loading
        let loadingElement = this.state.loading ? <p><em>Loading {this.state.speciesName}...</em></p> : null

        return (
            <tr key={pokemon.id}>
                <td>
                    <input
                        type="text"
                        value={this.state.speciesName}
                        onChange={this.handleSearchChange}
                        onKeyDown={this.findPokemon}
                    />
                    {loadingElement}
                </td>
                <td>{pokemon.order}</td>
                <td>
                    <img
                        src={pokemon.spriteUrl}
                        alt={pokemon.englishName}
                        style={{ width: 60, height: 60 }}>
                    </img>
                </td>
                <td>{pokemon.englishName}</td>
                <td>{pokemon.typeDescription}</td>
            </tr>
        );
    }

    render() {
        return this.renderPokemon(this.state.pokemon)
    }

    // updates the component state with the newly-searched species name
    handleSearchChange(e: any) {
        // get new value from input field
        const newName = e.target.value.toLowerCase()
        console.log(`Pokemon selector ${this.props.index}: set search term to '${newName}'`)

        // set new state
        this.setState({
            speciesName: newName
        })
    }

    // retrieves the given Pokemon species from PokemonController
    async findPokemon(e: any) {
        // only update if we need to
        if (e.key === 'Enter' && this.state.speciesName !== this.state.pokemon.name) {
            this.setState({
                loading: true
            })

            // get Pokemon data
            const speciesName = this.state.speciesName
            console.log(`Pokemon selector ${this.props.index}: getting species '${speciesName}'...`)
            const response = await fetch(`pokemon/${speciesName}`)

            if (response.status === 200) {
                // get JSON payload
                const newPokemon = await response.json()
                console.log(`Pokemon selector ${this.props.index}: got species '${speciesName}'`)

                // set new Pokemon in state
                this.setState({
                    pokemon: newPokemon
                })
            }
            else if (response.status === 500) {
                // species endpoint couldn't be found
                console.log(`Pokemon selector ${this.props.index}: couldn't get species '${speciesName}'!`)
                console.log(`(if '${speciesName}' looks valid, PokeAPI might be down!)`)
                console.log(response)
            }
            else {
                // some other error
                console.log(`Pokemon selector ${this.props.index}: tried to get species '${speciesName}' but failed with status ${response.status}!`)
                console.log("(ya boi needs to add some logic to handle this...)")
                console.log(response)
            }

            // no longer loading
            this.setState({
                loading: false
            })
        }
    }
}