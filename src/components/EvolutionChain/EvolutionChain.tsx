import React, { Component } from "react"

import { EvolutionTree } from "./EvolutionTree"

import { IHasIndex } from "../CommonMembers"

import { getSpeciesIds } from "../../models/Helpers"
import { EvolutionChainEntry } from "../../models/swagger"

import "./EvolutionChain.scss"

interface IEvolutionChainProps extends IHasIndex {
    /**
     * The ID of the species this chain is being shown for.
     */
    pokemonSpeciesId: number | undefined

    /**
     * The IDs of the species available in the parent selector.
     */
    availableSpeciesIds: number[]

    /**
     * Whether to show the species' shiny sprites.
     */
    showShinySprites: boolean

    /**
     * Whether to show the evolution chain.
     */
    shouldShowChain: boolean

    /**
     * Handler for setting the species in the parent component.
     */
    setSpecies: (pokemonSpeciesId: number) => void
}

interface IEvolutionChainState {
    /**
     * The evolution chain.
     */
    evolutionChain: EvolutionChainEntry | undefined

    /**
     * Whether we're loading the evolution chain.
     */
    loadingChain: boolean
}

/**
 * Component for showing a set of stats as a graph.
 */
export class EvolutionChain extends Component<IEvolutionChainProps, IEvolutionChainState> {
    /**
     * Constructor.
     */
    constructor(props: IEvolutionChainProps) {
        super(props)
        this.state = {
            evolutionChain: undefined,
            loadingChain: false
        }
    }

    /**
     * Fetch the evolution chain if necessary.
     */
    componentDidUpdate(previousProps: IEvolutionChainProps) {
        // don't fetch if we're loading
        if (this.state.loadingChain) {
            return
        }

        let previousSpeciesId = previousProps.pokemonSpeciesId
        let speciesId = this.props.pokemonSpeciesId
        let speciesChanged = previousSpeciesId !== speciesId

        // species is the same, don't fetch
        if (!speciesChanged) {
            return
        }

        // species has changed, fetch chain if we don't have one
        let chain = this.state.evolutionChain
        if (chain === undefined) {
            this.fetchEvolutionChain()
            return
        }

        // if we've got a new species, fetch chain
        if (previousSpeciesId === undefined && speciesId !== undefined) {
            this.fetchEvolutionChain()
            return
        }

        // if we've now got no species, clear chain
        if (previousSpeciesId !== undefined && speciesId === undefined) {
            this.fetchEvolutionChain()
            return
        }

        // species has changed - only fetch if new one is in a different chain
        let chainSpeciesIds = getSpeciesIds(chain)
        let previousSpeciesInChain = chainSpeciesIds.includes(previousSpeciesId!)
        let speciesInChain = chainSpeciesIds.includes(speciesId!)
        let chainChanged = previousSpeciesInChain !== speciesInChain

        if (chainChanged) {
            this.fetchEvolutionChain()
        }
    }

    /**
     * Renders the component.
     */
    render() {
        return this.renderEvolutionChain()
    }

    /**
     * Renders the evolution chain.
     */
    renderEvolutionChain() {
        if (!this.props.shouldShowChain) {
            return (
                <div className="flex-center evolution-chain">
                    -
                </div>
            )
        }

        if (this.state.loadingChain) {
            return (
                <div className="flex-center evolution-chain">
                    Loading...
                </div>
            )
        }

        let chain = this.state.evolutionChain?.chain
        if (chain === undefined) {
            return (
                <div className="flex-center evolution-chain">
                    this Pokemon does not evolve
                </div>
            )
        }

        return (
            <EvolutionTree
                chain={chain}
                index={this.props.index}
                pokemonSpeciesId={this.props.pokemonSpeciesId}
                availableSpeciesIds={this.props.availableSpeciesIds}
                showShinySprites={this.props.showShinySprites}
                setSpecies={(pokemonSpeciesId: number) => this.props.setSpecies(pokemonSpeciesId)} />
        )
    }

    /**
     * Fetches the evolution chain of the species.
     */
    fetchEvolutionChain() {
        let speciesId = this.props.pokemonSpeciesId
        if (speciesId !== undefined) {
            console.log(`Evolution chain ${this.props.index}: getting evolution chain for species ${speciesId}...`)

            // loading begins
            this.setState({ loadingChain: true })

            // construct endpoint URL
            let endpointUrl = this.constructEndpointUrl(speciesId)

            // get evolution chain
            fetch(endpointUrl)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Evolution chain ${this.props.index}: tried to get evolution chain for species ${speciesId} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then((chain: EvolutionChainEntry) => {
                    this.setState({ evolutionChain: chain })
                })
                .catch(error => {
                    console.error(error)
                    this.setState({ evolutionChain: undefined })
                })
                .finally(() => this.setState({ loadingChain: false }))
        }
        else {
            this.setState({ evolutionChain: undefined })
        }
    }

    /**
     * Returns the endpoint to use when fetching the evolution chain of the species with the given
     * ID.
     */
    constructEndpointUrl(pokemonSpeciesId: number): string {
        return `${process.env.REACT_APP_API_URL}/evolutionChain/${pokemonSpeciesId}`
    }
}