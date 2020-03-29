import React, { Component } from "react"
import { IHasCommon } from "./CommonMembers"

interface ICaptureLocationsProps extends IHasCommon {
    /**
     * The ID of the Pokemon to show capture locations for.
     */
    pokemonId: number | undefined,

    /**
     * Whether to show the capture locations.
     */
    showLocations: boolean
}

interface ICaptureLocationsState {
    /**
     * The capture locations to show.
     */
    locations: any,

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
            locations: null,
            loadingLocations: false,
            locationTooltipOpen: []
        }
    }

    componentDidMount() {
        this.fetchCaptureLocations()
    }

    componentDidUpdate(previousProps: ICaptureLocationsProps) {
        // refresh capture locations if the version group changed...
        let previousVersionGroupId = previousProps.versionGroupId
        let versionGroupId = this.props.versionGroupId
        let versionGroupChanged = versionGroupId !== previousVersionGroupId

        // ...or if the Pokemon ID changed
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanged = pokemonId !== previousPokemonId

        if (versionGroupChanged || pokemonChanged) {
            this.fetchCaptureLocations()
        }
    }

    render() {
        return this.renderCaptureLocations()
    }

    renderCaptureLocations() {
        let encountersElement = (
            <div>
                -
            </div>
        )

        if (this.hasPokemon()) {
            encountersElement = (
                <div>
                    No capture locations in this version group
                </div>
            )

            if (this.hasLocations()) {
                let encounters = this.state.locations.encounters
                let matchingEncounters = encounters.filter((e: any) => e.id === this.props.versionGroupId)
                if (matchingEncounters.length <= 0) {
                    return encountersElement
                }

                let encountersData = matchingEncounters[0].data

                let items = []
                for (let row = 0; row < encountersData.length; row++) {
                    // ensure each headers have unique IDs between all instances
                    let id = `locations${this.props.index}row${row}`
                    let encounter = encountersData[row]

                    let displayName = "encounter"

                    let matchingNames = encounter.displayNames.filter((n: any) => n.language === "en")
                    if (matchingNames.length > 0) {
                        displayName = matchingNames[0].name
                    }

                    items.push(
                        <div key={id}>
                            {displayName}
                        </div>
                    )
                }

                return (
                    <div>
                        {items}
                    </div>
                )
            }
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

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.props.pokemonId !== undefined
    }

    // returns true if we have capture locations
    hasLocations() {
        let locations = this.state.locations
        return locations !== null && locations.encounters.length > 0
    }

    // fetches the Pokemon's capture locations from EncounterController
    fetchCaptureLocations() {
        let pokemonId = this.props.pokemonId
        if (pokemonId === undefined) {
            this.setState({ locations: null })
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
            .then(locations => this.setState({ locations: locations }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingLocations: false }))
    }

    // returns the endpoint to use when fetching encounters of the given Pokemon
    constructEndpointUrl(pokemonId: number): string {
        return `${process.env.REACT_APP_API_URL}/encounter/${pokemonId}`
    }
}
