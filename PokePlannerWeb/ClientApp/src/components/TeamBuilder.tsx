import React, { Component } from 'react';
import { PokemonSelector } from './PokemonSelector';
import { Container } from 'reactstrap';

export class TeamBuilder extends Component<{}, {
    /**
     * List of version groups.
     */
    versionGroups: string[],

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number,

    /**
     * Whether the page is loading.
     */
    loading: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            versionGroups: [],
            versionGroupIndex: -1,
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
                    versionGroups: groups
                })
            }
            )
            .then(() => fetch("versionGroup/selected"))
            .then((response) => response.text())
            .then((idx) => {
                this.setState({
                    versionGroupIndex: Number(idx),
                    loading: false
                })
            }
            )
    }

    // loads type efficacy data
    async loadTypeEfficacy() {
        let index = this.state.versionGroupIndex
        await fetch(`efficacy/${index}`, { method: "POST" })
    }

    // set selected version group
    async handleVersionGroupChange(e: any) {
        const idx = Number(e.target.value)
        this.setState({ versionGroupIndex: idx });
        await fetch("versionGroup/selected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index: idx })
        })
    }

    renderVersionGroupMenu() {
        if (this.state.loading) {
            return null
        }

        let versionGroupMenu = (
            <select value={this.state.versionGroupIndex} onChange={this.handleVersionGroupChange}>
                {this.state.versionGroups.map((vg, index) => {
                    return <option key={index} value={index}>{vg}</option>
                })}
            </select>
        )

        return (
            <p>Game version: {versionGroupMenu}</p>
        )
    }

    renderPokemonTable() {
        let versionGroupIndex = this.state.versionGroupIndex
        return (
            <Container>
                <PokemonSelector index={0} versionGroupIndex={versionGroupIndex} />
                <PokemonSelector index={1} versionGroupIndex={versionGroupIndex} />
                <PokemonSelector index={2} versionGroupIndex={versionGroupIndex} />
                <PokemonSelector index={3} versionGroupIndex={versionGroupIndex} />
                <PokemonSelector index={4} versionGroupIndex={versionGroupIndex} />
                <PokemonSelector index={5} versionGroupIndex={versionGroupIndex} />
            </Container>
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
