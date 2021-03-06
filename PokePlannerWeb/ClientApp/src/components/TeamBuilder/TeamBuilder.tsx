import React, { Component } from 'react'
import { Input, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'

import { PokedexPanel } from '../PokedexPanel/PokedexPanel'

import { IHasVersionGroup, IHasHideTooltips } from '../CommonMembers'

import { GenerationEntry } from '../../models/GenerationEntry'
import { PokemonSpeciesEntry } from '../../models/PokemonSpeciesEntry'
import { StatEntry } from '../../models/StatEntry'
import { TypeEntry } from '../../models/TypeEntry'
import { VersionGroupEntry } from '../../models/VersionGroupEntry'

import { CookieHelper } from '../../util/CookieHelper'

/**
 * The number of Pokemon panels to show.
 * */
const TEAM_SIZE: number = 1

interface ITeamBuilderState extends IHasVersionGroup, IHasHideTooltips {
    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * Whether the Pokemon species are loading.
     */
    loadingSpecies: boolean

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * Whether the generations are loading.
     */
    loadingGenerations: boolean

    /**
     * List of version groups.
     */
    versionGroups: VersionGroupEntry[]

    /**
     * Whether the version groups are loading.
     */
    loadingVersionGroups: boolean

    /**
     * List of types.
     */
    types: TypeEntry[]

    /**
     * Whether the types are loading.
     */
    loadingTypes: boolean

    /**
     * The base stats.
     */
    baseStats: StatEntry[]

    /**
     * Whether the base stat names are loading.
     */
    loadingBaseStats: boolean

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
            generations: [],
            loadingGenerations: true,
            versionGroups: [],
            loadingVersionGroups: true,
            types: [],
            loadingTypes: true,
            versionGroupId: undefined,
            baseStats: [],
            loadingBaseStats: true,
            ignoreValidity: CookieHelper.getFlag("ignoreValidity"),
            hideTooltips: CookieHelper.getFlag("hideTooltips")
        }
    }

    componentDidMount() {
        this.getSpecies()
        this.fetchGenerations()
        this.fetchTypes()
        this.getVersionGroups()
            .then(() => {
                this.getBaseStats(this.state.versionGroupId)
            })
    }

    render() {
        let menu = this.renderMenu()

        let pokedexPanels = this.pageIsLoading()
            ? <p><em>Loading...</em></p>
            : this.renderPokedexPanels()

        return (
            <div>
                <p>Build your Pokemon team!</p>
                {menu}
                {pokedexPanels}
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
        let options = this.state.versionGroups.map(vg => ({
            label: vg.getDisplayName("en") ?? `(versionGroup${vg.versionGroupId})`,
            value: vg.versionGroupId
        }))

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

    renderPokedexPanels() {
        let items = []

        for (let i = 0; i < TEAM_SIZE; i++) {
            items.push(
                <PokedexPanel
                    key={i}
                    index={i}
                    versionGroup={this.getVersionGroup()}
                    ignoreValidity={this.state.ignoreValidity}
                    toggleIgnoreValidity={() => this.toggleIgnoreValidity()}
                    hideTooltips={this.state.hideTooltips}
                    species={this.state.species}
                    generations={this.state.generations}
                    types={this.state.types}
                    baseStats={this.state.baseStats} />
            )

            if (i < TEAM_SIZE - 1) {
                items.push(<hr></hr>)
            }
        }

        return <div>{items}</div>
    }

    /**
     * Returns the entry for the selected version group.
     */
    getVersionGroup() {
        return this.state.versionGroups.find(g => g.versionGroupId === this.state.versionGroupId)
    }

    // load all species
    getSpecies() {
        let endpoint = this.constructSpeciesEndpoint()
        fetch(endpoint)
            .then((response) => response.json())
            .then((species: PokemonSpeciesEntry[]) => {
                let concreteSpecies = species.map(PokemonSpeciesEntry.from)
                this.setState({ species: concreteSpecies })
            })
            .catch(error => console.error(error))
            .finally(() => this.setState({ loadingSpecies: false }))
    }

    /**
     * Constructs the endpoint for requesting species data.
     */
    constructSpeciesEndpoint() {
        let apiUrl = process.env.REACT_APP_API_URL
        let endpoint = `${apiUrl}/species`

        let speciesLimit = process.env.REACT_APP_SPECIES_LIMIT
        let speciesOffset = process.env.REACT_APP_SPECIES_OFFSET

        if (speciesLimit !== undefined && speciesOffset !== undefined) {
            let startId = Number(speciesOffset) + 1
            let endId = Number(speciesOffset) + Number(speciesLimit)
            console.log(`Fetching ${speciesLimit} species (${startId} - ${endId})`)

            endpoint += `?limit=${speciesLimit}&offset=${speciesOffset}`
        }

        return endpoint
    }

    /**
     * Fetches all generations.
     */
    fetchGenerations() {
        this.setState({ loadingGenerations: true })

        fetch(`${process.env.REACT_APP_API_URL}/generation`)
            .then(response => response.json())
            .then((groups: GenerationEntry[]) => {
                let concreteGenerations = groups.map(GenerationEntry.from)
                this.setState({ generations: concreteGenerations })
            })
            .catch(error => console.error(error))
            .finally(() => this.setState({ loadingGenerations: false }))
    }

    // load all version groups
    async getVersionGroups() {
        await fetch(`${process.env.REACT_APP_API_URL}/versionGroup/all`)
            .then(response => response.json())
            .then((groups: VersionGroupEntry[]) => {
                let concreteVersionGroups = groups.map(VersionGroupEntry.from)
                this.setState({ versionGroups: concreteVersionGroups })
            })
            .then(() => {
                // try get version group ID from cookies
                let versionGroupId = CookieHelper.getNumber("versionGroupId")
                if (versionGroupId === undefined) {
                    // fall back to latest one
                    let groups = this.state.versionGroups
                    versionGroupId = groups[groups.length - 1].versionGroupId
                }

                this.setState({
                    versionGroupId: versionGroupId
                })
            })
            .catch(error => console.error(error))
            .finally(() => this.setState({ loadingVersionGroups: false }))
    }

    /**
     * Fetches all types.
     */
    fetchTypes() {
        this.setState({ loadingTypes: true })

        fetch(`${process.env.REACT_APP_API_URL}/type`)
            .then(response => response.json())
            .then((types: TypeEntry[]) => {
                let concreteTypes = types.map(TypeEntry.from)
                this.setState({ types: concreteTypes })
            })
            .catch(error => console.error(error))
            .finally(() => this.setState({ loadingTypes: false }))
    }

    /**
     * Retrieves the stats for the given version group from TypeController.
     */
    getBaseStats(versionGroupId: number | undefined) {
        if (versionGroupId === undefined) {
            return
        }

        console.log(`Team builder: getting base stats for version group ${versionGroupId}...`)

        // loading begins
        this.setState({ loadingBaseStats: true })

        // get base stat names
        fetch(`${process.env.REACT_APP_API_URL}/stat/${versionGroupId}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Team builder: couldn't get base stat names for version group ${versionGroupId}!`)
            })
            .then(response => response.json())
            .then((baseStats: StatEntry[]) => {
                let concreteBaseStats = baseStats.map(StatEntry.from)
                this.setState({ baseStats: concreteBaseStats })
            })
            .catch(error => console.error(error))
            .then(() => this.setState({ loadingBaseStats: false }))
    }

    // set selected version group
    setVersionGroup(versionGroupId: number) {
        this.setState({ versionGroupId: versionGroupId })

        // set cookie
        CookieHelper.set("versionGroupId", versionGroupId)

        // reload base stat names
        this.getBaseStats(versionGroupId)
    }

    // toggle validity check on Pokemon
    toggleIgnoreValidity() {
        CookieHelper.set("ignoreValidity", !this.state.ignoreValidity)

        this.setState(previousState => ({
            ignoreValidity: !previousState.ignoreValidity
        }))
    }

    // toggle tooltip hiding
    toggleHideTooltips() {
        CookieHelper.set("hideTooltips", !this.state.hideTooltips)

        this.setState(previousState => ({
            hideTooltips: !previousState.hideTooltips
        }))
    }

    /**
     * Returns whether the page is loading.
     */
    pageIsLoading() {
        return this.state.loadingSpecies
            || this.state.loadingVersionGroups
            || this.state.loadingGenerations
            || this.state.loadingTypes
    }
}
