import React, { Component } from 'react'
import { Input, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'
import { PokemonPanel } from './PokemonPanel'
import { TypeSet } from '../models/TypeSet'
import { IHasVersionGroup, IHasHideTooltips } from './CommonMembers'

/**
 * The number of Pokemon panels to show.
 * */
const TEAM_SIZE: number = 6

/**
 * The number of rows to split the Pokemon panels across.
 */
const NUMBER_OF_ROWS: number = 2

interface ITeamBuilderState extends IHasVersionGroup, IHasHideTooltips {
    /**
     * List of Pokemon species names.
     */
    speciesNames: string[],

    /**
     * List of version groups.
     */
    versionGroups: string[],

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
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean
}

/**
 * Component for building a Pokemon team.
 */
export class TeamBuilder extends Component<any, ITeamBuilderState> {
    constructor(props: any) {
        super(props)
        this.state = {
            speciesNames: [],
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
        this.loadSpeciesNames()
        this.loadVersionGroups()
            .then(() => {
                this.loadStats()
                    .then(() => this.getBaseStatNames(this.state.versionGroupIndex))
                this.getTypeSet(this.state.versionGroupIndex)
                this.loadTypeEfficacy(this.state.versionGroupIndex)
            })
    }

    // load all species names
    loadSpeciesNames() {
        fetch("species/allNames")
            .then((response) => response.json())
            .then(speciesNames => this.setState({ speciesNames: speciesNames }))
            .catch(error => console.log(error))
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
    async setVersionGroup(idx: number) {
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

    // toggle validity check on Pokemon
    toggleIgnoreValidity() {
        this.setState((previousState) => ({
            ignoreValidity: !previousState.ignoreValidity
        }))
    }

    // toggle tooltip hiding
    toggleHideTooltips() {
        this.setState((previousState) => ({
            hideTooltips: !previousState.hideTooltips
        }))
    }

    render() {
        let menu = this.renderMenu()

        let pokemonPanels = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderPokemonPanels()

        return (
            <div>
                <p>Build your Pokemon team!</p>
                {menu}
                {pokemonPanels}
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
            <div className="flex">
                <div className="margin-right">
                    {versionGroupMenu}
                </div>
                <div className="margin-right">
                    {toggleSet}
                </div>
                <div>

                </div>
            </div>
        )
    }

    renderVersionGroupMenu() {
        let options = this.state.versionGroups.map((vg, index) => {
            return {
                value: index,
                label: vg
            }
        })

        return (
            <FormGroup>
                <Label for="versionGroupSelect">Game Version</Label>

                <Select
                    id="versionGroupSelect"
                    className="version-group-select"
                    defaultValue={options[this.state.versionGroupIndex]}
                    onChange={(e: any) => this.setVersionGroup(e.value)}
                    options={options} />
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
                        onChange={() => this.toggleIgnoreValidity()} />
                    <Label for="ignoreValidityCheckbox" check>
                        Ignore Pokemon validity in game version
                    </Label>
                </FormGroup>

                <FormGroup check>
                    <Input
                        type="checkbox"
                        id="hideTooltipsCheckbox"
                        checked={this.state.hideTooltips}
                        onChange={() => this.toggleHideTooltips()} />
                    <Label for="hideTooltipsCheckbox" check>
                        Hide tooltips
                </Label>
                </FormGroup>
            </div>
        )
    }

    renderPokemonPanels() {
        let rows = []
        let itemsPerRow = TEAM_SIZE / NUMBER_OF_ROWS

        for (let row = 0; row < NUMBER_OF_ROWS; row++) {
            let items = []
            for (let col = 0; col < itemsPerRow; col++) {
                let index = row * itemsPerRow + col
                items.push(
                    <PokemonPanel
                        key={index}
                        index={index}
                        versionGroupIndex={this.state.versionGroupIndex}
                        ignoreValidity={this.state.ignoreValidity}
                        toggleIgnoreValidity={() => this.toggleIgnoreValidity()}
                        hideTooltips={this.state.hideTooltips}
                        speciesNames={this.state.speciesNames}
                        typeSet={this.state.typeSet}
                        baseStatNames={this.state.baseStatNames} />
                )
            }

            rows.push(
                <div
                    key={row}
                    className="flex margin-bottom">
                    {items}
                </div>
            )
        }

        return (
            <div>
                {rows}
            </div>
        )
    }
}
