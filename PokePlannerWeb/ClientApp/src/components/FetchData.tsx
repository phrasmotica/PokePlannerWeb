import React, { Component } from 'react';

export class FetchData extends Component<{}, {
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
            pokemon: [],
            loading: true
        }
    }

    componentDidMount() {
        this.populatePokemonData();
    }

    static renderPokemonTable(pokemon: any) {
        return (
            <table className='table table-striped' aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {pokemon.map((p: any) =>
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : FetchData.renderPokemonTable(this.state.pokemon);

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>This component demonstrates fetching data from the server.</p>
                {contents}
            </div>
        );
    }

    // fetches data from PokemonController
    async populatePokemonData() {
        const response = await fetch('pokemon');
        const data = await response.json();
        this.setState({
            pokemon: data,
            loading: false
        })
    }
}
