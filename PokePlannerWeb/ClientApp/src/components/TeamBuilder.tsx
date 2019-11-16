import React, { Component } from 'react';

export class TeamBuilder extends Component<{}, {
    /**
     * The names of Pokemon species entered into input fields.
     */
    speciesNames: string[],

    /**
     * The Pokemon to display.
     */
    pokemon: any[],

    /**
     * Whether the page is loading.
     */
    loading: boolean
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            speciesNames: Array(6).fill(''),
            pokemon: [],
            loading: true
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            // initialise with objects with unique ids for whenwe render the table
            pokemon: Array.from(Array(6).keys()).map(i => { return { id: i } }),
            loading: false
        })
    }

    renderPokemonTable(pokemon: any) {
        return (
            <table className='table table-striped' aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Search</th>
                        <th>Id</th>
                        <th>Sprite</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {pokemon.map((p: any, index: number) =>
                        <tr key={p.id}>
                            <td>
                                <input
                                    type="text"
                                    value={this.state.speciesNames[index]}
                                    onChange={(e) => this.handleSearchChange(e, index)}
                                    onKeyDown={(e) => this.findPokemon(e, index)}
                                />
                            </td>
                            <td>{p.order}</td>
                            <td>
                                <img
                                    src={p.spriteUrl}
                                    alt={p.englishName}
                                    style={{ width: 60, height: 60 }}>
                                </img>
                            </td>
                            <td>{p.englishName}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonTable(this.state.pokemon);

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                {contents}
            </div>
        );
    }

    // updates the component state with the newly-searched species name
    handleSearchChange(e: any, index: number) {
        // get new value from input field
        var newNames = this.state.speciesNames
        newNames[index] = e.target.value
        console.log(`Got new names: ${newNames}`)

        // set new state
        this.setState({
            speciesNames: newNames
        })
    }

    // retrieves the given Pokemon species from PokemonController
    async findPokemon(e: any, index: number) {
        if (e.key === 'Enter') {
            // get Pokemon data
            const speciesName = this.state.speciesNames[index]
            console.log(`Getting new species ${speciesName}...`)
            const response = await fetch(`pokemon/${speciesName}`)
            const newPokemon = await response.json()
            console.log(`Got new species ${speciesName}`)

            // create new data array
            var newData = this.state.pokemon
            newData[index] = newPokemon

            // set new state
            this.setState({
                pokemon: newData,
                loading: false
            })
        }
    }
}
