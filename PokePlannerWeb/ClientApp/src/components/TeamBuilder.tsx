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
    versionGroups: any[],

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
            versionGroupId: undefined,
            loading: true,
            typeSet: {
                versionGroupId: undefined,
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
                    .then(() => this.getBaseStatNames(this.state.versionGroupId))
                this.getTypeSet(this.state.versionGroupId)
                this.loadTypeEfficacy(this.state.versionGroupId)
            })
    }

    // load all species names
    loadSpeciesNames() {
        fetch("species/allNames")
            .then(response => response.json())
            .then(speciesNames => this.setState({ speciesNames: speciesNames }))
            .catch(error => console.log(error))
    }

    // load all version groups
    async loadVersionGroups() {
        // get list of version groups
        await fetch("versionGroup", { method: "POST" })
            .then(() => fetch("versionGroup/all"))
            .then(response => response.json())
            .then((groups: any[]) => this.setState({
                versionGroups: groups,
                versionGroupId: groups[groups.length - 1].versionGroupId
            }))
            .catch(error => console.log(error))
            .finally(() => this.setState({ loading: false }))
    }

    // load all stats
    async loadStats() {
        await fetch("stat", { method: "POST" })
    }

    // retrieves the type set for the given version group from TypeController
    async getTypeSet(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        console.log(`Team builder: getting type set for version group ${versionGroupId}...`)

        // loading begins
        this.setState({ loadingTypeSet: true })

        // get type set
        fetch(`type/typeSet/${versionGroupId}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Team builder: couldn't get type set for version group ${versionGroupId}!`)
            })
            .then(response => response.json())
            .then(typeSet => this.setState({ typeSet: typeSet }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypeSet: false }))
    }

    // retrieves the type set for the given version group from TypeController
    async getBaseStatNames(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        console.log(`Team builder: getting base stat names for version group ${versionGroupId}...`)

        // loading begins
        this.setState({ loadingBaseStatNames: true })

        // get base stat names
        fetch(`stat/baseStatNames/${versionGroupId}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Team builder: couldn't get base stat names for version group ${versionGroupId}!`)
            })
            .then(response => response.json())
            .then(baseStatNames => this.setState({ baseStatNames: baseStatNames }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingBaseStatNames: false }))
    }

    // loads type efficacy data
    async loadTypeEfficacy(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        fetch(`efficacy/${versionGroupId}`, { method: "POST" })
            .catch(error => console.log(error))
    }

    // set selected version group
    async setVersionGroup(versionGroupId: number) {
        this.setState({ versionGroupId: versionGroupId })

        // reload type set and efficacy
        this.getTypeSet(versionGroupId)
        this.loadTypeEfficacy(versionGroupId)
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
        let options = this.state.versionGroups.map(vg => {
            return {
                label: vg.displayNames.filter((n: any) => n.language === "en")[0].name,
                value: vg.versionGroupId
            }
        })

        let defaultOption = options.filter(o => o.value == this.state.versionGroupId)

        return (
            <FormGroup>
                <Label for="versionGroupSelect">Game Version</Label>

                <Select
                    id="versionGroupSelect"
                    className="version-group-select"
                    defaultValue={defaultOption}
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
                        versionGroupId={this.state.versionGroupId}
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
