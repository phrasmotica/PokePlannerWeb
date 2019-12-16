import React, { Component } from 'react';
import { PokemonSelector } from './PokemonSelector';

export class TeamBuilder extends Component<{}, {
    /**
     * Whether the page is loading.
     */
    loading: boolean
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loading: false
        })
    }

    renderPokemonTable() {
        return (
            <table className='table table-striped' aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Search</th>
                        <th>Id</th>
                        <th>Sprite</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Efficacy</th>
                    </tr>
                </thead>
                <tbody>
                    <PokemonSelector index={0}/>
                    <PokemonSelector index={1}/>
                    <PokemonSelector index={2}/>
                    <PokemonSelector index={3}/>
                    <PokemonSelector index={4}/>
                    <PokemonSelector index={5}/>
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonTable();

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                {contents}
            </div>
        );
    }
}
