import React, { Component } from "react"
import { Button } from "reactstrap"
import { FaSistrix } from "react-icons/fa"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { ChainLinkEntry, EvolutionDetailEntry } from "../../models/EvolutionChainEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import "./EvolutionChain.scss"
import "./EvolutionTree.scss"

interface IEvolutionTreeProps extends IHasIndex {
    /**
     * The chain to render.
     */
    chain: ChainLinkEntry

    /**
     * The ID of the species this chain is being shown for.
     */
    speciesId: number | undefined

    /**
     * The IDs of the species available in the parent selector.
     */
    availableSpeciesIds: number[]

    /**
     * Whether to show the species' shiny sprites.
     */
    showShinySprites: boolean

    /**
     * Handler for setting the species in the parent component.
     */
    setSpecies: (speciesId: number) => void
}

interface IEvolutionTreeState {
    /**
     * Whether each chain link is expanded.
     */
    isExpanded: boolean[]
}

/**
 * Component for rendering an evolution chain as a tree.
 */
export class EvolutionTree extends Component<IEvolutionTreeProps, IEvolutionTreeState> {
    /**
     * The number of expansion buttons rendered so far.
     */
    expandButtonCount: number = 0

    /**
     * Constructor.
     */
    constructor(props: IEvolutionTreeProps) {
        super(props)

        let nodeCount = this.props.chain.size()
        this.state = {
            isExpanded: new Array(nodeCount).fill(false)
        }
    }

    /**
     * Renders the component.
     */
    render() {
        this.expandButtonCount = 0

        return (
            <div className="evolutionTree">
                {this.renderChainLink(this.props.chain)}
            </div>
        )
    }

    /**
     * Renders the chain link.
     */
    renderChainLink(link: ChainLinkEntry) {
        let isRoot = link.evolutionDetails.length <= 0
        let className = isRoot ? "" : "evolutionTreeNode"

        let expandButton = this.renderExpandButton(link)

        let speciesElement = (
            <div className="evolutionTreeSpeciesContainer">
                {expandButton}
                {this.renderSpeciesName(link.species)}
                {this.renderOpenButton(link.species)}
            </div>
        )

        let isExpanded = this.state.isExpanded[this.expandButtonCount - 1]

        let middleElement = undefined
        if (isExpanded) {
            middleElement = (
                <div className="flex">
                    <div className="separate-right">
                        {this.renderSpeciesSprite(link.species)}
                    </div>

                    {this.renderTransition(link)}
                </div>
            )
        }

        return (
            <div
                key={key(link)}
                className={className}>
                {speciesElement}
                {middleElement}
                {link.evolvesTo.map(l => this.renderChainLink(l))}
            </div>
        )
    }

    /**
     * Renders an expand button for this chain link.
     */
    renderExpandButton(link: ChainLinkEntry) {
        let index = this.expandButtonCount
        const onClick = () => this.toggleShowEvolutionDetails(index)

        let isExpanded = this.state.isExpanded[this.expandButtonCount++]
        let buttonIcon = isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />

        return (
            <Button
                color="link"
                className="transitionButton"
                onMouseUp={onClick}>
                {buttonIcon}
            </Button>
        )
    }

    /**
     * Renders the name of the species.
     */
    renderSpeciesName(species: PokemonSpeciesEntry) {
        let speciesId = species.speciesId
        let speciesName = species.getDisplayName("en") ?? species.name
        let nameElement = <span>{speciesName}</span>

        let isCurrentSpecies = speciesId === this.props.speciesId
        if (isCurrentSpecies) {
            nameElement = <span><b>{speciesName}</b></span>
        }

        return (
            <span className="evolutionTreeSpeciesButton margin-right-small">
                {nameElement}
            </span>
        )
    }

    /**
     * Renders a button for opening the given species in the selector.
     */
    renderOpenButton(species: PokemonSpeciesEntry) {
        let speciesId = species.speciesId
        let isCurrentSpecies = speciesId === this.props.speciesId
        if (isCurrentSpecies) {
            return null
        }

        let speciesAvailable = this.props.availableSpeciesIds.includes(speciesId)

        return (
            <Button
                color="success"
                disabled={!speciesAvailable}
                className="evolutionTreeOpenButton"
                onMouseUp={() => this.props.setSpecies(speciesId)}>
                <div className="flex-center">
                    <FaSistrix />
                </div>
            </Button>
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
                <div className="evolutionTreeSprite">
                    (no sprite)
                </div>
            )
        }

        return (
            <div className="evolutionTreeSprite">
                <img
                    className="inherit-size"
                    alt={`sprite${this.props.index}`}
                    src={spriteUrl} />
            </div>
        )
    }

    /**
     * Renders the transition from this chain link to the next one.
     */
    renderTransition(link: ChainLinkEntry) {
        if (link.evolutionDetails.length <= 0) {
            return (
                <div
                    key={key(link.species)}
                    className="evolutionTreeTransition">
                    unevolved
                </div>
            )
        }

        let details = link.evolutionDetails.map(d => this.renderEvolutionDetail(d))

        return (
            <div
                key={key(link.species)}
                className="evolutionTreeTransition">
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
                items.push(<span key={items.length}>{triggerElement}</span>)
            }
        }

        let item = detail.item
        if (item !== null) {
            let itemName = item.getDisplayName("en") ?? item.name
            items.push(<span key={items.length}>use {itemName}</span>)
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

            items.push(<span key={items.length}>must be {genderName}</span>)
        }

        let heldItem = detail.heldItem
        if (heldItem !== null) {
            let itemName = heldItem.getDisplayName("en") ?? heldItem.name
            items.push(<span key={items.length}>holding {itemName}</span>)
        }

        let knownMove = detail.knownMove
        if (knownMove !== null) {
            let moveName = knownMove.getDisplayName("en") ?? knownMove.name
            items.push(<span key={items.length}>knowing {moveName}</span>)
        }

        let knownMoveType = detail.knownMoveType
        if (knownMoveType !== null) {
            let typeName = knownMoveType.getDisplayName("en") ?? knownMoveType.name
            items.push(<span key={items.length}>knowing a {typeName}-type move</span>)
        }

        let location = detail.location
        if (location !== null) {
            let locationName = location.getDisplayName("en") ?? location.name
            items.push(<span key={items.length}>at {locationName}</span>)
        }

        if (detail.minLevel !== null) {
            items.push(<span key={items.length}>level {detail.minLevel}</span>)
        }

        if (detail.minHappiness !== null) {
            items.push(<span key={items.length}>at least {detail.minHappiness} happiness</span>)
        }

        if (detail.minBeauty !== null) {
            items.push(<span key={items.length}>at least {detail.minBeauty} beauty</span>)
        }

        if (detail.minAffection !== null) {
            items.push(<span key={items.length}>at least {detail.minAffection} affection</span>)
        }

        if (detail.needsOverworldRain) {
            items.push(<span key={items.length}>while raining</span>)
        }

        let partySpecies = detail.partySpecies
        if (partySpecies !== null) {
            let speciesName = partySpecies.getDisplayName("en") ?? partySpecies.name
            items.push(<span key={items.length}>with {speciesName} in the party</span>)
        }

        let partyType = detail.partyType
        if (partyType !== null) {
            let typeName = partyType.getDisplayName("en") ?? partyType.name
            items.push(<span key={items.length}>with a {typeName}-type in the party</span>)
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

            items.push(<span key={items.length}>with {relationElement}</span>)
        }

        if (detail.timeOfDay !== null) {
            items.push(<span key={items.length}>during {detail.timeOfDay}</span>)
        }

        let tradeSpecies = detail.tradeSpecies
        if (tradeSpecies !== null) {
            let speciesName = tradeSpecies.getDisplayName("en") ?? tradeSpecies.name
            items.push(<span key={items.length}>trade with {speciesName}</span>)
        }

        if (detail.turnUpsideDown) {
            items.push(<span key={items.length}>while the 3DS is turned upside down</span>)
        }

        return (
            <div key={key(detail)}>
                {items}
            </div>
        )
    }

    /**
     * Toggles showing the evolution details with the given index.
     */
    toggleShowEvolutionDetails(index: number) {
        let newShowEvolutionDetails = this.state.isExpanded.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        this.setState({ isExpanded: newShowEvolutionDetails })
    }
}