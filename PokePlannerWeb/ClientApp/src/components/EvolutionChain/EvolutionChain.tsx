import React, { Component } from "react"
import { Button } from "reactstrap"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { EvolutionChainEntry, ChainLinkEntry, EvolutionDetailEntry } from "../../models/EvolutionChainEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import "./EvolutionChain.scss"

interface IEvolutionChainProps extends IHasIndex {
    /**
     * The ID of the species this chain is being shown for.
     */
    speciesId: number | undefined

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
     * Fetch the evolution chain if necessary.
     */
    componentDidUpdate(previousProps: IEvolutionChainProps) {
        // don't fetch if we're loading
        if (this.state.loadingChain) {
            return
        }

        let previousSpeciesId = previousProps.speciesId
        let speciesId = this.props.speciesId
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
        let chainSpeciesIds = chain.getSpeciesIds()
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

        // TODO: find a package for rendering a tree
        return (
            <div className="flex-center evolution-chain">
                {this.renderDepthLists(chain)}
            </div>
        )
    }

    /**
     * Renders the chain as a list of its depth lists.
     */
    renderDepthLists(chain: ChainLinkEntry) {
        let depthListElements = []

        let depthLists = chain.toDepthLists()
        for (let list of depthLists) {
            // arrows and evolution details
            let transitionElements = []

            // species name
            let speciesElements = []

            for (let i = 0; i < list.length; i++) {
                let link = list[i]

                if (link.evolutionDetails.length > 0) {
                    transitionElements.push(this.renderTransition(link))
                    if (i < list.length - 1) {
                        transitionElements.push(<hr className="chain-separator"></hr>)
                    }
                }

                speciesElements.push(this.renderChainLink(link))
                if (i < list.length - 1) {
                    speciesElements.push(<hr className="chain-separator"></hr>)
                }
            }

            depthListElements.push(
                <div>
                    {transitionElements}
                </div>
            )

            depthListElements.push(
                <div>
                    {speciesElements}
                </div>
            )
        }

        return depthListElements
    }

    /**
     * Renders the chain link.
     */
    renderChainLink(link: ChainLinkEntry) {
        let speciesId = link.species.speciesId
        let isCurrentSpecies = speciesId === this.props.speciesId
        let speciesName = link.species.getDisplayName("en") ?? link.species.name

        let nameElement = <span>{speciesName}</span>
        if (isCurrentSpecies) {
            nameElement = <span><b>{speciesName}</b></span>
        }

        return (
            <div key={key(link)}>
                {this.renderSpeciesSprite(link.species)}

                <div className="flex-center">
                    <Button
                        color="link"
                        className="chain-member"
                        onMouseUp={() => this.props.setSpecies(speciesId)}>
                        {nameElement}
                    </Button>
                </div>
            </div>
        )
    }

    /**
     * Renders the species' sprite.
     */
    renderSpeciesSprite(species: PokemonSpeciesEntry) {
        let spriteUrl = this.props.showShinySprites
                      ? species.shinySpriteUrl
                      : species.spriteUrl

        if (spriteUrl === null || spriteUrl === "") {
            return (
                <div className="flex-center sprite margin-auto-horiz">
                    (no sprite)
                </div>
            )
        }

        return (
            <div className="sprite margin-auto-horiz">
                <img
                    className="inherit-size"
                    alt={`sprite${this.props.index}`}
                    src={spriteUrl} />
            </div>
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
            if (trigger.evolutionTriggerId === 1 && detail.minLevel === null) {
                triggerElement = trigger.getDisplayName("en") ?? "level up"
            }
            else if (trigger.evolutionTriggerId === 2) {
                triggerElement = trigger.getDisplayName("en") ?? "trade"
            }
            else if (trigger.evolutionTriggerId === 4) {
                triggerElement = trigger.getDisplayName("en") ?? "shed"
            }

            if (triggerElement !== undefined) {
                items.push(<span>{triggerElement}</span>)
            }
        }

        let item = detail.item
        if (item !== null) {
            let itemName = item.getDisplayName("en") ?? item.name
            items.push(<span>use {itemName}</span>)
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

        let heldItem = detail.heldItem
        if (heldItem !== null) {
            let itemName = heldItem.getDisplayName("en") ?? heldItem.name
            items.push(<span>holding {itemName}</span>)
        }

        let knownMove = detail.knownMove
        if (knownMove !== null) {
            let moveName = knownMove.getDisplayName("en") ?? knownMove.name
            items.push(<span>knowing {moveName}</span>)
        }

        let knownMoveType = detail.knownMoveType
        if (knownMoveType !== null) {
            let typeName = knownMoveType.getDisplayName("en") ?? knownMoveType.name
            items.push(<span>knowing a {typeName}-type move</span>)
        }

        let location = detail.location
        if (location !== null) {
            let locationName = location.getDisplayName("en") ?? location.name
            items.push(<span>at {locationName}</span>)
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

        let partySpecies = detail.partySpecies
        if (partySpecies !== null) {
            let speciesName = partySpecies.getDisplayName("en") ?? partySpecies.name
            items.push(<span>with {speciesName} in the party</span>)
        }

        let partyType = detail.partyType
        if (partyType !== null) {
            let typeName = partyType.getDisplayName("en") ?? partyType.name
            items.push(<span>with a {typeName}-type in the party</span>)
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
            items.push(<span>during {detail.timeOfDay}</span>)
        }

        let tradeSpecies = detail.tradeSpecies
        if (tradeSpecies !== null) {
            let speciesName = tradeSpecies.getDisplayName("en") ?? tradeSpecies.name
            items.push(<span>trade with {speciesName}</span>)
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
    constructEndpointUrl(speciesId: number): string {
        return `${process.env.REACT_APP_API_URL}/evolutionChain/${speciesId}`
    }
}