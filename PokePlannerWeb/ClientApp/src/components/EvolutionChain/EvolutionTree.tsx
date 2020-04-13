import React, { Component } from "react"
import { Button } from "reactstrap"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { ChainLinkEntry, EvolutionDetailEntry } from "../../models/EvolutionChainEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import "./EvolutionChain.scss"

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

}

/**
 * Component for rendering an evolution chain as a tree.
 */
export class EvolutionTree extends Component<IEvolutionTreeProps, IEvolutionTreeState> {
    /**
     * Renders the component.
     */
    render() {
        return (
            <div className="evolution-chain">
                {this.renderTree(this.props.chain)}
            </div>
        )
    }

    /**
     * Renders the chain link as a tree.
     */
    renderTree(link: ChainLinkEntry) {
        let numChildren = link.evolvesTo.length
        let widthStyle = {
            width: `${100 / (numChildren + 1)}%`,
        }

        let transitionElement = null
        if (link.evolutionDetails.length > 0) {
            let transitionButton = this.renderTransitionButton(link)

            // empty divs to ensure arrow is centred above the right species
            let paddingElements = []
            for (let i = 0; i < numChildren; i++) {
                paddingElements.push(<div key={i} style={widthStyle}></div>)
            }

            transitionElement = (
                <div className="transition">
                    <div className="center-text" style={widthStyle}>
                        {transitionButton}
                    </div>

                    {paddingElements}
                </div>
            )
        }

        let linkElement = this.renderChainLink(link)

        let childElements = link.evolvesTo.map(l => this.renderTree(l))

        // wurmple's chain is wrongly serialised by PokeAPI but I've got a PR to fix it...
        // https://github.com/PokeAPI/pokeapi/pull/485
        return (
            <div>
                {transitionElement}

                <div className="evolution-tree-item">
                    {linkElement}

                    <div className="flex-center">
                        {childElements}
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Renders a button for the transition from this chain link to the next one.
     */
    renderTransitionButton(link: ChainLinkEntry) {
        // TODO: click to toggle evolution details
        return (
            <Button color="link" className="transition-button">
                &#x21b4;
            </Button>
        )
    }

    /**
     * Renders the chain link.
     */
    renderChainLink(link: ChainLinkEntry) {
        let sprite = this.renderSpeciesSprite(link.species)

        let separator = (
            <div className="flex-center">
                <hr style={{ width: "80%", margin: 0 }}></hr>
            </div>
        )

        let button = this.renderSpeciesButton(link.species)

        return (
            <div key={key(link)}>
                {sprite}
                {separator}
                {button}
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
     * Renders a button for the species.
     */
    renderSpeciesButton(species: PokemonSpeciesEntry) {
        let speciesId = species.speciesId
        let isCurrentSpecies = speciesId === this.props.speciesId
        let speciesName = species.getDisplayName("en") ?? species.name

        let nameElement = <span>{speciesName}</span>
        if (isCurrentSpecies) {
            nameElement = <span><b>{speciesName}</b></span>
        }

        let speciesAvailable = this.props.availableSpeciesIds.includes(speciesId)

        return (
            <div className="flex-center">
                <Button
                    color="link"
                    disabled={!speciesAvailable}
                    className="species-button"
                    onMouseUp={() => this.props.setSpecies(speciesId)}>
                    {nameElement}
                </Button>
            </div>
        )
    }

    /**
     * Renders the transition from this chain link to the next one.
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
}