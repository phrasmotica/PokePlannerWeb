import React, { Component } from "react"
import fuzzysort from "fuzzysort"
import { ListGroup, ListGroupItem, Button, Collapse, Input } from "reactstrap"
import key from "weak-key"

import { EncountersEntry, EncounterEntry, EncounterMethodDetails } from "../../models/EncountersEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"
import { WithId } from "../../models/WithId"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { NumberHelper, Interval } from "../../util/NumberHelper"

import "./CaptureLocations.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface ICaptureLocationsProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * The version group.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * The ID of the Pokemon to show capture locations for.
     */
    pokemonId: number | undefined

    /**
     * Whether to show the capture locations.
     */
    showLocations: boolean
}

interface ICaptureLocationsState {
    /**
     * The capture locations to show.
     */
    locations: EncountersEntry | undefined

    /**
     * Whether we're loading the capture locations.
     */
    loadingLocations: boolean

    /**
     * Whether the location tooltips are open.
     */
    locationTooltipOpen: boolean[]

    /**
     * The search term.
     */
    searchTerm: string

    /**
     * Whether each encounter's info pane is open.
     */
    encountersAreOpen: WithId<boolean>[]
}

/**
 * Component for displaying a Pokemon's capture locations.
 */
export class CaptureLocations extends Component<ICaptureLocationsProps, ICaptureLocationsState> {
    constructor(props: ICaptureLocationsProps) {
        super(props)
        this.state = {
            locations: undefined,
            loadingLocations: false,
            locationTooltipOpen: [],
            searchTerm: "",
            encountersAreOpen: []
        }
    }

    componentDidMount() {
        this.fetchCaptureLocations()
    }

    componentDidUpdate(previousProps: ICaptureLocationsProps) {
        // refresh capture locations if the Pokemon ID changed
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanged = pokemonId !== previousPokemonId

        if (pokemonChanged) {
            this.fetchCaptureLocations()
        }

        // reset info panel toggle state if version group ID changed
        let previousVersionGroupId = previousProps.versionGroup?.versionGroupId
        let versionGroupId = this.props.versionGroup?.versionGroupId
        let versionGroupChanged = versionGroupId !== previousVersionGroupId

        if (versionGroupChanged) {
            this.setState(state => {
                let locations = state.locations?.encounters
                let encounters = locations?.find(e => e.id === versionGroupId)?.data ?? []

                return {
                    encountersAreOpen: encounters.map(
                        e => new WithId<boolean>(e.locationAreaId, false)
                    )
                }
            })
        }
    }

    render() {
        return (
            <div style={{ marginTop: 5 }}>
                <div className="topBar">
                    {this.renderCatchRate()}
                    {this.renderSearchBar()}
                </div>

                {this.renderCaptureLocations()}
            </div>
        )
    }

    /**
     * Renders the species' catch rate.
     */
    renderCatchRate() {
        let catchRateElement = "-"

        let species = this.props.species
        if (species !== undefined) {
            catchRateElement = `${species.catchRate}`
        }

        return (
            <div className="catchRate flex-center">
                Catch rate: {catchRateElement}
            </div>
        )
    }

    /**
     * Renders the search bar.
     */
    renderSearchBar() {
        return (
            <div className="encountersSearchBarContainer flex-center">
                <Input
                    className="encountersSearchBar"
                    placeholder="search"
                    onChange={e => this.setSearchTerm(e.target.value)} />
            </div>
        )
    }

    /**
     * Renders the Pokemon's capture locations.
     */
    renderCaptureLocations() {
        if (this.state.loadingLocations) {
            return (
                <ListGroup className="encountersListGroup">
                    <ListGroupItem>
                        Loading...
                    </ListGroupItem>
                </ListGroup>
            )
        }

        let encountersElement = (
            <ListGroup className="encountersListGroup">
                <ListGroupItem>
                    -
                </ListGroupItem>
            </ListGroup>
        )

        if (this.props.showLocations && this.hasPokemon()) {
            encountersElement = (
                <ListGroup className="encountersListGroup">
                    <ListGroupItem>
                        No capture locations in this version group
                    </ListGroupItem>
                </ListGroup>
            )

            let locations = this.state.locations
            if (locations !== undefined) {
                let versionGroupId = this.props.versionGroup?.versionGroupId
                let matchingEncounter = locations.encounters.find(e => e.id === versionGroupId)
                if (matchingEncounter === undefined) {
                    return encountersElement
                }

                let encountersData = matchingEncounter.data
                let filteredData = this.filterEncounterEntries(encountersData)

                let items = []
                if (filteredData.length > 0) {
                    for (let row = 0; row < filteredData.length; row++) {
                        let encounter = filteredData[row]
                        let encounterName = encounter.getDisplayName("en") ?? `encounter`
                        let encounterNameElement = (
                            <span className="center-text">
                                <b>
                                    {encounterName}
                                </b>
                            </span>
                        )

                        let encounterId = encounter.locationAreaId
                        const openInfoPane = () => this.toggleEncounterOpen(encounterId)
                        let encounterNameButton = (
                            <Button
                                color="link"
                                onMouseUp={openInfoPane}>
                                {encounterNameElement}
                            </Button>
                        )

                        let versions = this.props.versionGroup?.versions ?? []

                        let versionElements = versions.map(v => {
                            let versionName = v.getDisplayName("en") ?? "version"
                            let versionNameElement = (
                                <div className="captureLocationsVersionName">
                                    {versionName}
                                </div>
                            )

                            let methodElements = []
                            let versionDetails = encounter.details.find(e => e.id === v.versionId)
                            if (versionDetails === undefined) {
                                methodElements.push(<div>-</div>)
                            }
                            else {
                                let detailsList = versionDetails.data
                                methodElements = detailsList.map((details, index) => {
                                    return this.renderEncounterMethodDetails(
                                        details,
                                        index < detailsList.length - 1
                                    )
                                })
                            }

                            return (
                                <div
                                    key={key(v)}
                                    className="captureLocationsVersionItem">
                                    {versionNameElement}
                                    {methodElements}
                                </div>
                            )
                        })

                        let isOpen = this.state.encountersAreOpen.find(e => e.id === encounterId)?.data ?? false
                        let infoPane = (
                            <Collapse isOpen={isOpen}>
                                <div className="flex encounterInfo">
                                    {versionElements}
                                </div>
                            </Collapse>
                        )

                        items.push(
                            <ListGroupItem key={key(encounter)}>
                                {encounterNameButton}
                                {infoPane}
                            </ListGroupItem>
                        )
                    }
                }
                else {
                    if (this.hasFilters()) {
                        items.push(
                            <ListGroupItem key={0}>
                                All encounters have been filtered
                            </ListGroupItem>
                        )
                    }
                    else {
                        items.push(
                            <ListGroupItem key={0}>
                                -
                            </ListGroupItem>
                        )
                    }
                }

                return (
                    <ListGroup className="encountersListGroup">
                        {items}
                    </ListGroup>
                )
            }

            // TODO: show "evolve {preEvolution}" if applicable, else show "Trade"
        }

        return encountersElement
    }

    /**
     * Renders the encounter method details.
     */
    renderEncounterMethodDetails(details: EncounterMethodDetails, addSeparator = false) {
        let methodName = details.method.getDisplayName("en") ?? details.method.name
        let methodElement = <div>{methodName}</div>

        // don't bother showing 100% chance for gift Pokemon
        let showChance = ![18, 19].includes(details.method.encounterMethodId)

        let conditionValueElements = details.conditionValuesDetails.map((cvd, i) => {
            let conditionsElement = undefined
            if (cvd.conditionValues.length > 0) {
                let conditions = cvd.conditionValues.map(v => v.getDisplayName("en") ?? v.name)
                                                    .join(", ")
                conditionsElement = <div>{conditions}</div>
            }

            let chanceElement = undefined
            if (showChance) {
                let chance = cvd.encounterDetails.map(ed => ed.chance)
                                                 .reduce((ed1, ed2) => ed1 + ed2)
                chanceElement = <div>{chance}% chance</div>
            }

            let levelRanges = cvd.encounterDetails.map(ed => new Interval(ed.minLevel, ed.maxLevel))
            let mergedLevelRanges = NumberHelper.mergeIntRanges(levelRanges)
            let intervalsSummary = mergedLevelRanges.map(i => i.summarise()).join(", ")

            let levelsElement = <div>level {intervalsSummary}</div>
            if (mergedLevelRanges.length > 1 || !mergedLevelRanges[0].isEmpty()) {
                levelsElement = <div>levels {intervalsSummary}</div>
            }

            let separator = undefined
            if (i < details.conditionValuesDetails.length - 1) {
                separator = <hr />
            }

            return (
                <div
                    key={key(cvd)}
                    className="conditionsContainer">
                    {conditionsElement}
                    {chanceElement}
                    {levelsElement}
                    {separator}
                </div>
            )
        })

        let separator = undefined
        if (addSeparator) {
            separator = <hr style={{ width: "90%" }} />
        }

        return (
            <div key={key(details)}>
                <div className="methodContainer">
                    {methodElement}
                </div>

                <div className="cveContainer">
                    {conditionValueElements}
                </div>

                {separator}
            </div>
        )
    }

    /**
     * Sets the search term.
     */
    setSearchTerm(term: string) {
        this.setState({ searchTerm: term })
    }

    /**
     * Filters the given list of encounters according to the current search term.
     */
    filterEncounterEntries(entries: EncounterEntry[]) {
        let searchTerm = this.state.searchTerm
        if (searchTerm === "") {
            return entries
        }

        let entryNames = entries.map(e => ({ id: e.locationAreaId, name: e.getDisplayName("en") }))
        const options = { key: 'name' }
        let results = fuzzysort.go(searchTerm, entryNames, options)

        let resultIds = results.map(r => r.obj.id)
        return entries.filter(e => resultIds.includes(e.locationAreaId))
    }

    // toggle the location tooltip with the given index
    toggleLocationTooltip(index: number) {
        let newLocationTooltipOpen = this.state.locationTooltipOpen.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        this.setState({
            locationTooltipOpen: newLocationTooltipOpen
        })
    }

    /**
     * Toggles the encounter info pane with the given index.
     */
    toggleEncounterOpen(id: number) {
        let newEncountersAreOpen = this.state.encountersAreOpen.map(item => {
            if (item.id === id) {
                return new WithId<boolean>(id, !item.data)
            }

            return item
        })

        this.setState({ encountersAreOpen: newEncountersAreOpen })
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.props.pokemonId !== undefined
    }

    /**
     * Returns whether any filters are active.
     */
    hasFilters() {
        return this.state.searchTerm.length > 0
    }

    // fetches the Pokemon's capture locations from EncounterController
    fetchCaptureLocations() {
        let pokemonId = this.props.pokemonId
        if (pokemonId === undefined) {
            this.setState({ locations: undefined })
            return
        }

        console.log(`Capture locations ${this.props.index}: getting capture locations for Pokemon ${pokemonId}...`)

        // loading begins
        this.setState({ loadingLocations: true })

        // construct endpoint URL
        let endpointUrl = this.constructEndpointUrl(pokemonId)

        // get encounter data
        fetch(endpointUrl)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Capture locations ${this.props.index}: tried to get capture locations for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then((encounters: EncountersEntry) => {
                let concreteLocations = {
                    pokemonId: encounters.pokemonId,
                    encounters: encounters.encounters.map(e => ({
                        id: e.id,
                        data: e.data.map(EncounterEntry.from)
                    }))
                }

                let versionGroupId = this.props.versionGroup?.versionGroupId
                let relevantEncounters = concreteLocations.encounters.find(
                    e => e.id === versionGroupId
                )?.data ?? []

                this.setState({
                    locations: concreteLocations,
                    encountersAreOpen: relevantEncounters.map(e => new WithId<boolean>(e.locationAreaId, false))
                })
            })
            .catch(error => console.error(error))
            .then(() => this.setState({ loadingLocations: false }))
    }

    // returns the endpoint to use when fetching encounters of the given Pokemon
    constructEndpointUrl(pokemonId: number): string {
        return `${process.env.REACT_APP_API_URL}/encounter/${pokemonId}`
    }
}
