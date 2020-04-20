﻿import React, { Component } from "react"
import { ListGroup, ListGroupItem, Button, Collapse } from "reactstrap"
import key from "weak-key"

import { EncountersEntry, EncounterEntry } from "../../models/EncountersEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"
import { WithId } from "../../models/WithId"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import "./CaptureLocations.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface ICaptureLocationsProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

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
    }

    render() {
        // TODO: show species catch rate and variety held items
        return (
            <div style={{ marginTop: 4 }}>
                {this.renderCaptureLocations()}
            </div>
        )
    }

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

                let items = []
                for (let row = 0; row < encountersData.length; row++) {
                    let encounter = encountersData[row]
                    let encounterName = encounter.getDisplayName("en") ?? `encounter`
                    let encounterNameElement = (
                        <span>
                            <b>
                                {encounterName}
                            </b>
                        </span>
                    )

                    let versions = this.props.versionGroup?.versions ?? []
                    let maxChances = versions.map(v => {
                        let maxChance = encounter.chances.find(c => c.id === v.versionId)!.data
                        return `${maxChance}% (${v.getDisplayName("en") ?? "version"})`
                    })
                    let maxChancesSummary = maxChances.join(", ")

                    let encounterId = encounter.locationAreaId
                    const openInfoPane = () => this.toggleEncounterOpen(encounterId)
                    let encounterNameButton = (
                        <div className="flex">
                            <Button
                                color="link"
                                onMouseUp={openInfoPane}>
                                {encounterNameElement}
                            </Button>

                            <span>
                                {maxChancesSummary}
                            </span>
                        </div>
                    )

                    // TODO: show encounter method details
                    let isOpen = this.state.encountersAreOpen.find(e => e.id === encounterId)?.data ?? false
                    let infoPane = (
                        <Collapse isOpen={isOpen}>
                            <div className="flex encounterInfo">
                                {encounterName}
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
                    })),
                }

                let versionGroupId = this.props.versionGroup?.versionGroupId
                let relevantEncounters = concreteLocations.encounters.find(
                    e => e.id === versionGroupId
                )!.data

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
