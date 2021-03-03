import React, { useState } from "react"
import { Button } from "reactstrap"
import { FaSistrix } from "react-icons/fa"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { getDisplayName, size } from "../../models/Helpers"

import {
    ChainLinkEntry,
    EvolutionDetailEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import "./EvolutionChain.scss"
import "./EvolutionTree.scss"

interface EvolutionTreeProps extends IHasIndex {
    /**
     * The chain to render.
     */
    chain: ChainLinkEntry

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
     * Handler for setting the species in the parent component.
     */
    setSpecies: (pokemonSpeciesId: number) => void
}

/**
 * Component for rendering an evolution chain as a tree.
 */
export const EvolutionTree = (props: EvolutionTreeProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean[]>(new Array(size(props.chain)).fill(false))

    let expandButtonCount = 0

    /**
     * Renders the chain link.
     */
    const renderChainLink = (link: ChainLinkEntry) => {
        let isRoot = link.evolutionDetails.length <= 0
        let className = isRoot ? "" : "evolutionTreeNode"

        let expandButton = renderExpandButton(link)

        let speciesElement = (
            <div className="evolutionTreeSpeciesContainer">
                {expandButton}
                {renderSpeciesName(link.species)}
                {renderOpenButton(link.species)}
            </div>
        )

        let middleElement = null

        let linkIsExpanded = isExpanded[expandButtonCount - 1]
        if (linkIsExpanded) {
            middleElement = (
                <div className="flex">
                    <div className="separate-right">
                        {renderSpeciesSprite(link.species)}
                    </div>

                    {renderTransition(link)}
                </div>
            )
        }

        return (
            <div
                key={key(link)}
                className={className}>
                {speciesElement}
                {middleElement}
                {link.evolvesTo.map(l => renderChainLink(l))}
            </div>
        )
    }

    /**
     * Renders an expand button for this chain link.
     */
    const renderExpandButton = (link: ChainLinkEntry) => {
        let index = expandButtonCount
        const onClick = () => toggleIsExpanded(index)

        let linkIsExpanded = isExpanded[expandButtonCount++]
        let buttonIcon = linkIsExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />

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
    const renderSpeciesName = (species: PokemonSpeciesEntry) => {
        let speciesId = species.pokemonSpeciesId
        let speciesName = getDisplayName(species, "en") ?? species.name
        let nameElement = <span>{speciesName}</span>

        let isCurrentSpecies = speciesId === props.pokemonSpeciesId
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
    const renderOpenButton = (species: PokemonSpeciesEntry) => {
        let speciesId = species.pokemonSpeciesId
        let isCurrentSpecies = speciesId === props.pokemonSpeciesId
        if (isCurrentSpecies) {
            return null
        }

        let speciesAvailable = props.availableSpeciesIds.includes(speciesId)

        return (
            <Button
                color="success"
                disabled={!speciesAvailable}
                className="evolutionTreeOpenButton"
                onMouseUp={() => props.setSpecies(speciesId)}>
                <div className="flex-center">
                    <FaSistrix />
                </div>
            </Button>
        )
    }

    /**
     * Renders the species' sprite.
     */
    const renderSpeciesSprite = (species: PokemonSpeciesEntry) => {
        let spriteUrl = props.showShinySprites
                      ? species.shinySpriteUrl
                      : species.spriteUrl

        if (!spriteUrl) {
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
                    alt={`sprite${props.index}`}
                    src={spriteUrl} />
            </div>
        )
    }

    /**
     * Renders the transition from this chain link to the next one.
     */
    const renderTransition = (link: ChainLinkEntry) => {
        if (link.evolutionDetails.length <= 0) {
            return (
                <div
                    key={key(link.species)}
                    className="evolutionTreeTransition">
                    unevolved
                </div>
            )
        }

        let details = link.evolutionDetails.map(d => renderEvolutionDetail(d))

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
    const renderEvolutionDetail = (detail: EvolutionDetailEntry) => {
        let items = []

        let trigger = detail.trigger
        if (trigger !== undefined) {
            let triggerElement = undefined

            // only need extra info for certain triggers
            // use-item is clear from other details
            if (trigger.evolutionTriggerId === 1 && detail.minLevel === undefined) {
                triggerElement = getDisplayName(trigger, "en") ?? trigger.name
            }
            else if (trigger.evolutionTriggerId === 2) {
                triggerElement = getDisplayName(trigger, "en") ?? trigger.name
            }
            else if (trigger.evolutionTriggerId === 4) {
                triggerElement = getDisplayName(trigger, "en") ?? trigger.name
            }

            if (triggerElement !== undefined) {
                items.push(<span key={items.length}>{triggerElement}</span>)
            }
        }

        let item = detail.item
        if (item !== undefined) {
            let itemName = getDisplayName(item, "en") ?? item.name
            items.push(<span key={items.length}>use {itemName}</span>)
        }

        let gender = detail.gender
        if (gender !== undefined) {
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
        if (heldItem !== undefined) {
            let itemName = getDisplayName(heldItem, "en") ?? heldItem.name
            items.push(<span key={items.length}>holding {itemName}</span>)
        }

        let knownMove = detail.knownMove
        if (knownMove !== undefined) {
            let moveName = getDisplayName(knownMove, "en") ?? knownMove.name
            items.push(<span key={items.length}>knowing {moveName}</span>)
        }

        let knownMoveType = detail.knownMoveType
        if (knownMoveType !== undefined) {
            let typeName = getDisplayName(knownMoveType, "en") ?? knownMoveType.name
            items.push(<span key={items.length}>knowing a {typeName}-type move</span>)
        }

        let location = detail.location
        if (location !== undefined) {
            let locationName = getDisplayName(location, "en") ?? location.name
            items.push(<span key={items.length}>at {locationName}</span>)
        }

        if (detail.minLevel !== undefined) {
            items.push(<span key={items.length}>level {detail.minLevel}</span>)
        }

        if (detail.minHappiness !== undefined) {
            items.push(<span key={items.length}>at least {detail.minHappiness} happiness</span>)
        }

        if (detail.minBeauty !== undefined) {
            items.push(<span key={items.length}>at least {detail.minBeauty} beauty</span>)
        }

        if (detail.minAffection !== undefined) {
            items.push(<span key={items.length}>at least {detail.minAffection} affection</span>)
        }

        if (detail.needsOverworldRain) {
            items.push(<span key={items.length}>while raining</span>)
        }

        let partySpecies = detail.partySpecies
        if (partySpecies !== undefined) {
            let speciesName = getDisplayName(partySpecies, "en") ?? partySpecies.name
            items.push(<span key={items.length}>with {speciesName} in the party</span>)
        }

        let partyType = detail.partyType
        if (partyType !== undefined) {
            let typeName = getDisplayName(partyType, "en") ?? partyType.name
            items.push(<span key={items.length}>with a {typeName}-type in the party</span>)
        }

        let relativePhysicalStats = detail.relativePhysicalStats
        if (relativePhysicalStats !== undefined) {
            let relationElement = "Attack = Defense"
            if (relativePhysicalStats === -1) {
                relationElement = "Attack < Defense"
            }
            else if (relativePhysicalStats === 1) {
                relationElement = "Attack > Defense"
            }

            items.push(<span key={items.length}>with {relationElement}</span>)
        }

        if (detail.timeOfDay !== undefined) {
            items.push(<span key={items.length}>during {detail.timeOfDay}</span>)
        }

        let tradeSpecies = detail.tradeSpecies
        if (tradeSpecies !== undefined) {
            let speciesName = getDisplayName(tradeSpecies, "en") ?? tradeSpecies.name
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
    const toggleIsExpanded = (index: number) => {
        let newIsExpanded = isExpanded.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        setIsExpanded(newIsExpanded)
    }

    return (
        <div className="evolutionTree">
            {renderChainLink(props.chain)}
        </div>
    )
}
