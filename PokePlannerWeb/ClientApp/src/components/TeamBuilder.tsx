import React, { Component } from 'react'
import { PokemonSelector } from './PokemonSelector'
import { Container } from 'reactstrap'

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
        super(props)
        this.state = {
            versionGroups: [],
            versionGroupIndex: -1,
            loading: true
        }

        this.handleVersionGroupChange = this.handleVersionGroupChange.bind(this)
    }

    componentDidMount() {
        this.loadVersionGroups()
            .then(() => this.loadTypeEfficacy(this.state.versionGroupIndex))
    }

    // load all version groups
    async loadVersionGroups() {
        // get list of version groups
        await fetch("versionGroup", { method: "POST" })
            .then(() => fetch("versionGroup/all"))
            .then((response) => response.json())
            .then((groups) => {
                this.setState({
                    versionGroups: groups
                })
            })
            .catch(error => console.log(error))

            // get selected version group
            .then(() => fetch("versionGroup/selected"))
            .then((response) => response.text())
            .then((idx) => {
                this.setState({
                    versionGroupIndex: Number(idx),
                    loading: false
                })
            })
            .catch(error => console.log(error))
    }

    // loads type efficacy data
    async loadTypeEfficacy(versionGroupIndex: number) {
        fetch(`efficacy/${versionGroupIndex}`, { method: "POST" })
            .catch(error => console.log(error))
    }

    // set selected version group
    async handleVersionGroupChange(e: any) {
        const idx = Number(e.target.value)
        this.setState({ versionGroupIndex: idx })

        // reload type efficacy
        this.loadTypeEfficacy(idx)

        // set index in backend
        fetch("versionGroup/selected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index: idx })
        })
            .catch(error => console.log(error))
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
        )
    }

    render() {
        let versionGroupMenu = this.renderVersionGroupMenu()

        let pokemonTable = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonTable()

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                {versionGroupMenu}
                {pokemonTable}
            </div>
        )
    }
}
