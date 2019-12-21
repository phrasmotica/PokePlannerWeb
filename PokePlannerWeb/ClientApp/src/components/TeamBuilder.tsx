import React, { Component } from 'react'
import { PokemonSelector } from './PokemonSelector'
import { Container } from 'reactstrap'
import { TypeSet } from '../models/TypeSet'

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
    loading: boolean,

    /**
     * The type set.
     */
    typeSet: TypeSet,

    /**
     * Whether we're loading the type set.
     */
    loadingTypeSet: boolean
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            versionGroups: [],
            versionGroupIndex: -1,
            loading: true,
            typeSet: {
                versionGroupId: -1,
                types: [],
                typesArePresent: []
            },
            loadingTypeSet: true
        }

        this.handleVersionGroupChange = this.handleVersionGroupChange.bind(this)
    }

    componentDidMount() {
        this.loadVersionGroups()
            .then(() => {
                this.getTypeSet(this.state.versionGroupIndex)
                this.loadTypeEfficacy(this.state.versionGroupIndex)
            })
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

    // retrieves the type set for the given version group from TypeController
    async getTypeSet(versionGroupIndex: number) {
        console.log(`Team builder: getting type set for version group ${versionGroupIndex}...`)

        // loading begins
        this.setState({
            loadingTypeSet: true
        })

        // get type set
        fetch(`type/typeSet/${versionGroupIndex}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Team builder: couldn't get type set for version group ${versionGroupIndex}!`)
            })
            .then(response => response.json())
            .then(typeSet => this.setState({ typeSet: typeSet }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypeSet: false }))
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

        // reload type set and efficacy
        this.getTypeSet(idx)
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
                <PokemonSelector
                    index={0}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
                <PokemonSelector
                    index={1}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
                <PokemonSelector
                    index={2}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
                <PokemonSelector
                    index={3}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
                <PokemonSelector
                    index={4}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
                <PokemonSelector
                    index={5}
                    versionGroupIndex={versionGroupIndex}
                    typeSet={this.state.typeSet} />
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
