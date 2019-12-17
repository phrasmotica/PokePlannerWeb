import React, { Component } from 'react';
import { PokemonSelector } from './PokemonSelector';

export class TeamBuilder extends Component<{}, {
    /**
     * List of version groups.
     */
    versionGroups: string[],

    /**
     * The selected version group.
     */
    versionGroup: string,

    /**
     * Whether the page is loading.
     */
    loading: boolean
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            versionGroups: [],
            versionGroup: "",
            loading: true
        }
    }

    componentDidMount() {
        this.loadVersionGroups()
        this.loadTypeEfficacy()
    }

    // load all version groups
    async loadVersionGroups() {
        fetch("versionGroup", { method: "POST" })
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

    renderVersionGroupMenu() {
        if (this.state.loading) {
            return (
                <select disabled>
                    <option>Loading...</option>
                </select>
            )
        }

        return (
            <select>
                {this.state.versionGroups.map(vg => {
                    return <option>{vg}</option>
                })}
            </select>
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

        let versionGroupMenu = this.renderVersionGroupMenu()

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                <p>Game version: {versionGroupMenu}</p>
                {contents}
            </div>
        );
    }
}
