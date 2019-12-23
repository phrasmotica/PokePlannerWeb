import React, { Component } from 'react'
import { Input, FormGroup, Label, Row, Col } from 'reactstrap'
import { PokemonSelector } from './PokemonSelector'
import { TypeSet } from '../models/TypeSet'

const TEAM_SIZE: number = 6

/**
 * Component for building a Pokemon team.
 */
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
    loadingTypeSet: boolean,

    /**
     * The base stat names.
     */
    baseStatNames: string[],

    /**
     * Whether we're loading the base stat names.
     */
    loadingBaseStatNames: boolean,

    /**
     * Whether species validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
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
            loadingTypeSet: true,
            baseStatNames: [],
            loadingBaseStatNames: true,
            ignoreValidity: false,
            hideTooltips: false
        }
    }

    componentDidMount() {
        this.loadVersionGroups()
            .then(() => {
                this.loadStats()
                    .then(() => this.getBaseStatNames(this.state.versionGroupIndex))
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
            .then((response) => response.json())
            .then((idx) => {
                this.setState({
                    versionGroupIndex: Number(idx),
                    loading: false
                })
            })
            .catch(error => console.log(error))
    }

    // load all stats
    async loadStats() {
        await fetch("stat", { method: "POST" })
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

    // retrieves the type set for the given version group from TypeController
    async getBaseStatNames(versionGroupIndex: number) {
        console.log(`Team builder: getting base stat names for version group ${versionGroupIndex}...`)

        // loading begins
        this.setState({
            loadingBaseStatNames: true
        })

        // get base stat names
        fetch(`stat/baseStatNames/${versionGroupIndex}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Team builder: couldn't get base stat names for version group ${versionGroupIndex}!`)
            })
            .then(response => response.json())
            .then(baseStatNames => this.setState({ baseStatNames: baseStatNames }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingBaseStatNames: false }))
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

    // toggle validity check on species
    handleIgnoreValidityChange() {
        this.setState((previousState) => ({
            ignoreValidity: !previousState.ignoreValidity
        }))
    }

    // toggle tooltip hiding
    handleHideTooltipsChange() {
        this.setState((previousState) => ({
            hideTooltips: !previousState.hideTooltips
        }))
    }

    render() {
        let menu = this.renderMenu()

        let pokemonTable = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonTable()

        return (
            <div>
                <h1 id="tableLabel">Pokemon</h1>
                <p>Build your Pokemon team!</p>
                {menu}
                {pokemonTable}
            </div>
        )
    }

    renderMenu() {
        if (this.state.loading) {
            return null
        }

        let versionGroupMenu = this.renderVersionGroupMenu()
        let toggleSet = this.renderToggleSet()

        return (
            <div>
                <Row>
                    <Col>
                        {versionGroupMenu}
                    </Col>
                    <Col>
                        {toggleSet}
                    </Col>
                    <Col>
                        
                    </Col>
                </Row>
            </div>
        )
    }

    renderVersionGroupMenu() {
        return (
            <FormGroup>
                <Label for="versionGroupSelect">Game Version</Label>
                <Input
                    type="select"
                    id="versionGroupSelect"
                    value={this.state.versionGroupIndex}
                    onChange={e => this.handleVersionGroupChange(e)}>
                    {this.state.versionGroups.map((vg, index) => {
                        return <option key={index} value={index}>{vg}</option>
                    })}
                </Input>
            </FormGroup>
        )
    }

    // returns the set of toggles for the menu
    renderToggleSet() {
        return (
            <div>
                <FormGroup check>
                    <Input
                        type="checkbox"
                        id="ignoreValidityCheckbox"
                        checked={this.state.ignoreValidity}
                        onChange={() => this.handleIgnoreValidityChange()} />
                    <Label for="ignoreValidityCheckbox" check>
                        Ignore Pokemon validity in game version
                    </Label>
                </FormGroup>

                <FormGroup check>
                    <Input
                        type="checkbox"
                        id="hideTooltipsCheckbox"
                        checked={this.state.hideTooltips}
                        onChange={() => this.handleHideTooltipsChange()} />
                    <Label for="hideTooltipsCheckbox" check>
                        Hide tooltips
                </Label>
                </FormGroup>
            </div>
        )
    }

    renderPokemonTable() {
        let pokemonSelectors = []
        for (var i = 0; i < TEAM_SIZE; i++) {
            pokemonSelectors.push(
                <PokemonSelector
                    key={i}
                    index={i}
                    versionGroupIndex={this.state.versionGroupIndex}
                    ignoreValidity={this.state.ignoreValidity}
                    hideTooltips={this.state.hideTooltips}
                    typeSet={this.state.typeSet} />
            )
        }

        return (
            <div>
                {pokemonSelectors}
            </div>
        )
    }
}
