import React, { Component } from "react"
import { Button } from "reactstrap"

import { IHasIndex } from "./CommonMembers"

import { EvolutionChainEntry, ChainLinkEntry } from "../models/EvolutionChainEntry"

import "./EvolutionChain.scss"
import key from "weak-key"

interface IEvolutionChainProps extends IHasIndex {
    /**
     * The ID of the species this chain is being shown for.
     */
    speciesId: number

    /**
     * Whether to show the evolution chain.
     */
    shouldShowChain: boolean

    /**
     * Handler for setting the species in the parent component.
     */
    setSpecies: (speciesId: number) => void
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
     * Fetch the evolution chain.
     */
    componentDidUpdate() {
        if (this.state.loadingChain) {
            return
        }

        // fetch chain if new species has a different chain
        let chain = this.state.evolutionChain
        let speciesId = this.props.speciesId
        let chainChanged = chain === undefined || !chain.getSpeciesIds().includes(speciesId)

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
                <div
                    className="flex-center evolution-chain"
                    style={{ marginTop: 4 }}>
                    -
                </div>
            )
        }

        if (this.state.loadingChain) {
            return (
                <div
                    className="flex-center evolution-chain"
                    style={{ marginTop: 4 }}>
                    Loading...
                </div>
            )
        }

        let chain = this.state.evolutionChain?.chain
        if (chain === undefined) {
            return (
                <div
                    className="flex-center evolution-chain"
                    style={{ marginTop: 4 }}>
                    this Pokemon does not evolve
                </div>
            )
        }

        // base link
        let chainLinks = [this.renderChainLink(chain)]

        while (chain.evolvesTo.length > 0) {
            chainLinks.push(
                <span key={key(chain.species)}>
                    ->
                </span>
            )

            for (let c of chain.evolvesTo) {
                chainLinks.push(this.renderChainLink(c))
            }

            // TODO: recursively push for all items in chain.evolvesTo
            chain = chain.evolvesTo[0]
        }

        return (
            <div
                className="flex-center evolution-chain"
                style={{ marginTop: 4 }}>
                {chainLinks}
            </div>
        )
    }

    /**
     * Renders the chain link.
     */
    renderChainLink(link: ChainLinkEntry) {
        let speciesId = link.species.id
        let isCurrentSpecies = speciesId === this.props.speciesId
        let speciesName = link.species.name

        let nameElement = <span>{speciesName}</span>
        if (isCurrentSpecies) {
            nameElement = <span><b>{speciesName}</b></span>
        }

        return (
            <Button
                key={key(link)}
                color="link"
                onMouseUp={() => this.props.setSpecies(speciesId)}>
                {nameElement}
            </Button>
        )
    }

    /**
     * Fetches the evolution chain of the species.
     */
    fetchEvolutionChain() {
        let speciesId = this.props.speciesId
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
                    let concreteChain = EvolutionChainEntry.from(chain)
                    this.setState({ evolutionChain: concreteChain })
                })
                .catch(error => console.error(error))
                .then(() => this.setState({ loadingChain: false }))
        }
    }

    /**
     * Returns the endpoint to use when fetching the evolution chain of the species with the given
     * ID.
     */
    constructEndpointUrl(speciesId: number): string {
        return `${process.env.REACT_APP_API_URL}/evolutionChain/${speciesId}`
    }
}