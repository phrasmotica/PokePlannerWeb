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
     * List of Pokemon species.
     */
    species: any[]

    /**
     * Whether the Pokemon species are loading.
     */
    loadingSpecies: boolean

    /**
     * List of version groups.
     */
    versionGroups: any[]

    /**
     * Whether the version groups are loading.
     */
    loadingVersionGroups: boolean

    /**
     * The type set.
     */
    typeSet: TypeSet

    /**
     * Whether the type set is loading.
     */
    loadingTypeSet: boolean

    /**
     * The base stat names.
     */
    baseStatNames: string[]

    /**
     * Whether the base stat names are loading.
     */
    loadingBaseStatNames: boolean

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
            species: [],
            loadingSpecies: true,
            versionGroups: [],
            loadingVersionGroups: true,
            versionGroupId: undefined,
            typeSet: {
                versionGroupId: undefined,
                typeIds: [],
                typesArePresent: []
            },
            loadingTypeSet: true,
            baseStatNames: [],
            loadingBaseStatNames: true,
            ignoreValidity: true,
            hideTooltips: false
        }
    }

    componentDidMount() {
        this.getSpecies()
        this.getVersionGroups()
            .then(() => {
                this.getBaseStatNames(this.state.versionGroupId)
                this.getTypeSet(this.state.versionGroupId)
            })
    }

    render() {
        let menu = this.renderMenu()

        let pokemonPanels = this.pageIsLoading()
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
        if (this.pageIsLoading()) {
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

        let defaultOption = options.filter(o => o.value === this.state.versionGroupId)

        return (
            <FormGroup>
                <Label for="versionGroupSelect">Game Version</Label>

                <Select
                    id="versionGroupSelect"
                    className="version-group-select"
                    defaultValue={defaultOption}
                    onChange={(option: any) => this.setVersionGroup(option.value)}
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
                        species={this.state.species}
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

    // load all species
    getSpecies() {
        fetch(`${process.env.REACT_APP_API_URL}/species?limit=10&offset=489`)
            .then(response => response.json())
            .then(species => this.setState({ species: species }))
            .catch(error => console.log(error))
            .finally(() => this.setState({ loadingSpecies: false }))
    }

    // load all version groups
    async getVersionGroups() {
        await fetch(`${process.env.REACT_APP_API_URL}/versionGroup/all`)
            .then(response => response.json())
            .then((groups: any[]) => this.setState({
                versionGroups: groups,
                versionGroupId: groups[groups.length - 1].versionGroupId
            }))
            .catch(error => console.log(error))
            .finally(() => this.setState({ loadingVersionGroups: false }))
    }

    // retrieves the type set for the given version group from TypeController
    getTypeSet(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        console.log(`Team builder: getting type set for version group ${versionGroupId}...`)

        // loading begins
        this.setState({ loadingTypeSet: true })

        // get type set
        fetch(`${process.env.REACT_APP_API_URL}/type/typeSet/${versionGroupId}`)
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
    getBaseStatNames(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        console.log(`Team builder: getting base stat names for version group ${versionGroupId}...`)

        // loading begins
        this.setState({ loadingBaseStatNames: true })

        // get base stat names
        fetch(`${process.env.REACT_APP_API_URL}/stat/baseStatNames/${versionGroupId}`)
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

    // set selected version group
    setVersionGroup(versionGroupId: number) {
        this.setState({ versionGroupId: versionGroupId })

        // reload type set and base stat names
        this.getTypeSet(versionGroupId)
        this.getBaseStatNames(versionGroupId)
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

    /**
     * Returns whether the page is loading.
     */
    pageIsLoading() {
        return this.state.loadingSpecies
            || this.state.loadingVersionGroups
    }
}
