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

    // retrieves the given Pokemon species from PokemonController
    async findPokemon(e: any) {
        // only update if we need to
        const newSpeciesName = e.target.value.toLowerCase()
        if (e.key === 'Enter' && newSpeciesName !== this.state.pokemon.name) {
            // loading begins
            this.setState({
                speciesName: newSpeciesName,
                loading: true
            })

            // get Pokemon data
            console.log(`Pokemon selector ${this.props.index}: getting species '${newSpeciesName}'...`)
            const response = await fetch(`pokemon/${newSpeciesName}`)

            if (response.status === 200) {
                // get JSON payload
                const newPokemon = await response.json()
                console.log(`Pokemon selector ${this.props.index}: got species '${newSpeciesName}'`)

                // set new Pokemon and update species name
                this.setState({
                    pokemon: newPokemon
                })
            }
            else if (response.status === 500) {
                // species endpoint couldn't be found
                console.log(`Pokemon selector ${this.props.index}: couldn't get species '${newSpeciesName}'!`)
                console.log(`(if '${newSpeciesName}' looks valid, PokeAPI might be down!)`)
                console.log(response)
            }
            else {
                // some other error
                console.log(`Pokemon selector ${this.props.index}: tried to get species '${newSpeciesName}' but failed with status ${response.status}!`)
                console.log("(ya boi needs to add some logic to handle this...)")
                console.log(response)
            }

            // finished loading
            this.setState({
                loading: false
            })
        }
    }
}