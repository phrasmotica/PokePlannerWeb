import React, { Component } from 'react';
import { PokemonSelector } from './PokemonSelector';

export class TeamBuilder extends Component<{}, {
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
            versionGroup: "",
            loading: true
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loading: false
        })

        this.getVersionGroup()
        this.loadTypeEfficacy()
    }

    // loads the latest version group and then displays it
    async getVersionGroup() {
        await fetch("versionGroup")
        let versionGroup = await (await fetch("versionGroup/selected")).text()
        this.setState({ versionGroup: versionGroup })
    }

    // loads type efficacy data
    async loadTypeEfficacy() {
        fetch("efficacy")
    }

    renderVersionGroupMenu() {
        return (
            <select>
                <option selected>{this.state.versionGroup}</option>
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
