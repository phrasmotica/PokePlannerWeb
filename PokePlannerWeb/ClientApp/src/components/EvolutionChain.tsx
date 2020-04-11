import React, { Component } from "react"
import { Button } from "reactstrap"

import { IHasIndex } from "./CommonMembers"

import { EvolutionChainEntry, ChainLinkEntry, EvolutionDetailEntry } from "../models/EvolutionChainEntry"

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
            for (let c of chain.evolvesTo) {
                chainLinks.push(this.renderTransition(c))
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
                className="chain-member"
                onMouseUp={() => this.props.setSpecies(speciesId)}>
                {nameElement}
            </Button>
        )
    }

    /**
     * Renders the chain link.
     */
    renderTransition(link: ChainLinkEntry) {
        let details = link.evolutionDetails.map(d => this.renderEvolutionDetail(d))

        return (
            <div key={key(link.species)}>
                {details}
            </div>
        )
    }

    /**
     * Renders the evolution detail.
     */
    renderEvolutionDetail(detail: EvolutionDetailEntry) {
        let items = []

        let trigger = detail.trigger
        if (trigger !== null) {
            let triggerElement = undefined

            // only need extra info for certain triggers
            // use-item is clear from other details
            if (trigger.id === 1 && detail.minLevel === null) {
                triggerElement = "level up"
            }
            else if (trigger.id === 2) {
                triggerElement = "trade"
            }
            else if (trigger.id === 4) {
                triggerElement = "shed"
            }

            if (triggerElement !== undefined) {
                items.push(<span>{triggerElement}</span>)
            }
        }

        if (detail.item !== null) {
            items.push(<span>use {detail.item.name}</span>)
        }

        let gender = detail.gender
        if (gender !== null) {
            // TODO: add gender entry to EvolutionDetailEntry (but no localised names yet...)
            let genderName = "female"
            if (gender === 2) {
                genderName = "male"
            }
            else if (gender === 3) {
                genderName = "genderless"
            }

            items.push(<span>must be {genderName}</span>)
        }

        if (detail.heldItem !== null) {
            items.push(<span>holding a {detail.heldItem.name}</span>)
        }

        if (detail.knownMove !== null) {
            items.push(<span>knowing {detail.knownMove.name}</span>)
        }

        if (detail.knownMoveType !== null) {
            items.push(<span>knowing a {detail.knownMoveType.name}-type move</span>)
        }

        if (detail.location !== null) {
            items.push(<span>at {detail.location.name}</span>)
        }

        if (detail.minLevel !== null) {
            items.push(<span>level {detail.minLevel}</span>)
        }

        if (detail.minHappiness !== null) {
            items.push(<span>at least {detail.minHappiness} happiness</span>)
        }

        if (detail.minBeauty !== null) {
            items.push(<span>at least {detail.minBeauty} beauty</span>)
        }

        if (detail.minAffection !== null) {
            items.push(<span>at least {detail.minAffection} affection</span>)
        }

        if (detail.needsOverworldRain) {
            items.push(<span>while raining</span>)
        }

        if (detail.partySpecies !== null) {
            items.push(<span>with {detail.partySpecies.name} in the party</span>)
        }

        if (detail.partyType !== null) {
            items.push(<span>with a {detail.partyType.name}-type in the party</span>)
        }

        let relativePhysicalStats = detail.relativePhysicalStats
        if (relativePhysicalStats !== null) {
            let relationElement = "Attack = Defense"
            if (relativePhysicalStats === -1) {
                relationElement = "Attack < Defense"
            }
            else if (relativePhysicalStats === 1) {
                relationElement = "Attack > Defense"
            }

            items.push(<span>with {relationElement}</span>)
        }

        if (detail.timeOfDay !== null) {
            items.push(<span>at {detail.timeOfDay}</span>)
        }

        if (detail.tradeSpecies !== null) {
            items.push(<span>trade with {detail.tradeSpecies.name}</span>)
        }

        if (detail.turnUpsideDown) {
            items.push(<span>while the 3DS is turned upside down</span>)
        }

        return (
            <div className="transition">
                <span style={{ fontSize: 24 }}>
                    &#x27F6;
                </span>
                {items}
            </div>
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