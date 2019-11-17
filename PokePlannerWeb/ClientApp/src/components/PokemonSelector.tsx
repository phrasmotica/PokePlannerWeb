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
    pokemon: any
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            speciesName: '',
            pokemon: {}
        }

        // bind event handlers to this object
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this.findPokemon = this.findPokemon.bind(this)
    }

    componentDidMount() {
        // finished loading
    }

    renderPokemon(pokemon: any) {
        return (
            <tr key={pokemon.id}>
                <td>
                    <input
                        type="text"
                        value={this.state.speciesName}
                        onChange={this.handleSearchChange}
                        onKeyDown={this.findPokemon}
                    />
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
            </tr>
        );
    }

    render() {
        return this.renderPokemon(this.state.pokemon)
    }

    // updates the component state with the newly-searched species name
    handleSearchChange(e: any) {
        // get new value from input field
        const newName = e.target.value
        console.log(`Pokemon selector ${this.props.index} got new name '${newName}'`)

        // set new state
        this.setState({
            speciesName: newName
        })
    }

    // retrieves the given Pokemon species from PokemonController
    async findPokemon(e: any) {
        if (e.key === 'Enter') {
            // get Pokemon data
            const speciesName = this.state.speciesName
            console.log(`Pokemon selector ${this.props.index} getting new species '${speciesName}'...`)
            const response = await fetch(`pokemon/${speciesName}`)
            const newPokemon = await response.json()
            console.log(`Pokemon selector ${this.props.index} got new species '${speciesName}'`)

            // set new state
            this.setState({
                pokemon: newPokemon
            })
        }
    }
}