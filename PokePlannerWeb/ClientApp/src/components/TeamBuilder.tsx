import React, { Component } from 'react';
import { PokemonSelector } from './PokemonSelector';

export class TeamBuilder extends Component<{}, {
    /**
     * List of version groups.
     */
    versionGroups: string[],

    /**
     * The index of the selected version group.
     */
    versionGroup: number,

    /**
     * Whether the page is loading.
     */
    loading: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            versionGroups: [],
            versionGroup: -1,
            loading: true
        }

        this.handleVersionGroupChange = this.handleVersionGroupChange.bind(this)
    }

    componentDidMount() {
        this.loadVersionGroups()
            .then(() => this.loadTypeEfficacy())
    }

    // load all version groups
    async loadVersionGroups() {
        await fetch("versionGroup", { method: "POST" })
            .then(() => fetch("versionGroup/all"))
            .then((response) => response.json())
            .then((groups) => {
                this.setState({
                    versionGroups: groups,
                    loading: false
                })
            }
            )
    }

    // loads type efficacy data
    async loadTypeEfficacy() {
        await fetch("efficacy", { method: "POST" })
    }

    // set selected version group
    async handleVersionGroupChange(e: any) {
        this.setState({ versionGroup: e.target.value });
        await fetch("versionGroup/selected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index: Number(e.target.value) })
        })
    }

    renderVersionGroupMenu() {
        if (this.state.loading) {
            return null
        }

        let versionGroupMenu = (
            <select onChange={this.handleVersionGroupChange}>
                {this.state.versionGroups.map((vg, index) => {
                    return <option value={index}>{vg}</option>
                })}
            </select>
        )

        return (
            <p>Game version: {versionGroupMenu}</p>
        )
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
                    <PokemonSelector index={0} />
                    <PokemonSelector index={1} />
                    <PokemonSelector index={2} />
                    <PokemonSelector index={3} />
                    <PokemonSelector index={4} />
                    <PokemonSelector index={5} />
                </tbody>
            </table>
        );
    }

    render() {
        let versionGroupMenu = this.renderVersionGroupMenu()

        let pokemonTable = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonTable();

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                {versionGroupMenu}
                {pokemonTable}
            </div>
        );
    }
}
