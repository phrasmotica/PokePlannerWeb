import React, { Component } from "react"
import { IHasCommon } from "./CommonMembers"

interface ICaptureLocationsProps extends IHasCommon {
    /**
     * The ID of the Pokemon to show capture locations for.
     */
    pokemonId: number,

    /**
     * Whether to show the capture locations.
     */
    showLocations: boolean
}

interface ICaptureLocationsState {
    /**
     * The capture locations to show.
     */
    locations: any[],

    /**
     * Whether we're loading the capture locations.
     */
    loadingLocations: boolean,

    /**
     * Whether the location tooltips are open.
     */
    locationTooltipOpen: boolean[]
}

/**
 * Component for displaying a Pokemon's capture locations.
 */
export class CaptureLocations extends Component<ICaptureLocationsProps, ICaptureLocationsState> {
    constructor(props: any) {
        super(props)
        this.state = {
            locations: [],
            loadingLocations: false,
            locationTooltipOpen: []
        }
    }

    componentDidMount() {
        // get locations
        this.getCaptureLocations()
    }

    componentDidUpdate(previousProps: ICaptureLocationsProps) {
        // refresh capture locations if the version group changed...
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        // ...or if the Pokemon ID changed
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanged = pokemonId !== previousPokemonId

        if (versionGroupChanged || pokemonChanged) {
            this.getCaptureLocations()
        }
    }

    render() {
        return this.renderCaptureLocations()
    }

    renderCaptureLocations() {
        let locations = this.state.locations
        let items = []

        for (let row = 0; row < locations.length; row++) {
            // ensure each headers have unique IDs between all instances
            let id = `locations${this.props.index}row${row}`

            let location = locations[row]
            items.push(
                <div id={id}>
                    {location.locationArea.name}
                </div>
            )
        }

        return (
            <div>
                {items}
            </div>
        )
    }

    // toggle the location tooltip with the given index
    toggleLocationTooltip(index: number) {
        let newLocationTooltipOpen = this.state.locationTooltipOpen.map((item, j) => {
            if (j == index) {
                return !item
            }

            return item
        })

        this.setState({
            locationTooltipOpen: newLocationTooltipOpen
        })
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.props.pokemonId > 0
    }

    // retrieves the Pokemon's capture locations from EncounterController
    getCaptureLocations() {
        if (this.hasPokemon()) {
            let pokemonId = this.props.pokemonId
            console.log(`Capture locations ${this.props.index}: getting capture locations for Pokemon ${pokemonId}...`)

            // loading begins
            this.setState({ loadingLocations: true })

            // construct endpoint URL
            let endpointUrl = this.constructEndpointUrl(pokemonId, this.props.versionGroupIndex)

            // get encounter data
            fetch(endpointUrl)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Capture locations ${this.props.index}: tried to get capture locations for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then(locations => this.setState({ locations: locations }))
                .catch(error => console.log(error))
                .then(() => this.setState({ loadingLocations: false }))
        }
    }

    // returns the endpoint to use when fetching encounters of the given Pokemon
    constructEndpointUrl(pokemonId: number, versionGroupIndex: number): string {
        return `encounter/${pokemonId}/${versionGroupIndex}`
    }
}