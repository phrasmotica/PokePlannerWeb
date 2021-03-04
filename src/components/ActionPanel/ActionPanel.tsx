import React, { useState } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { CaptureLocations } from "../CaptureLocations/CaptureLocations"
import { EvolutionChain } from "../EvolutionChain/EvolutionChain"
import { MoveList } from "../MoveList/MoveList"

import { getEffectiveTypes } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    VersionGroupEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

import "./ActionPanel.scss"

interface ActionPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * The ID of the Pokemon species.
     */
    pokemonSpeciesId: number | undefined

    /**
     * The species variety.
     */
    variety: PokemonEntry | undefined

    /**
     * The Pokemon form.
     */
    form: PokemonFormEntry | undefined

    /**
     * Whether to show info about the Pokemon.
     */
    shouldShowPokemon: boolean

    /**
     * Whether to show the shiny sprite.
     */
    showShinySprite: boolean

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesEntry | undefined) => void
}

/**
 * Renders moves, evolution trees, encounters, etc.
 */
export const ActionPanel = (props: ActionPanelProps) => {
    const [activeMoveTabKey, setActiveMoveTabKey] = useState<string | undefined>(
        CookieHelper.get(`panel${props.index}activeMoveTabKey`)
    )

    /**
     * Renders the move list.
     */
    const renderMoveList = () => {
        let typeIds = getEffectiveTypes(
            props.variety,
            props.form,
            props.versionGroup?.versionGroupId
        ).map(t => t.typeId)

        return (
            <MoveList
                index={props.index}
                versionGroupId={props.versionGroup?.versionGroupId}
                pokemonId={props.variety?.pokemonId}
                typeIds={typeIds}
                showMoves={props.shouldShowPokemon}
                hideTooltips={props.hideTooltips} />
        )
    }

    /**
     * Renders the capture locations.
     */
    const renderCaptureLocations = () => {
        return (
            <CaptureLocations
                index={props.index}
                pokemonId={props.variety?.pokemonId}
                versionGroup={props.versionGroup}
                species={getSpecies()}
                showLocations={props.shouldShowPokemon}
                hideTooltips={props.hideTooltips} />
        )
    }

    /**
     * Returns the data object for the selected species.
     */
    const getSpecies = () => {
        let speciesId = props.pokemonSpeciesId
        return props.species.find(s => s.pokemonSpeciesId === speciesId)
    }

    /**
     * Renders the evolution chain.
     */
    const renderEvolutionChain = () => (
        <div className="inherit-size">
            <EvolutionChain
                index={props.index}
                pokemonSpeciesId={props.pokemonSpeciesId}
                availableSpeciesIds={props.species.map(s => s.pokemonSpeciesId)}
                showShinySprites={props.showShinySprite}
                shouldShowChain={props.shouldShowPokemon}
                setSpecies={props.setSpecies} />
        </div>
    )

    /**
     * Sets the key of the active move tab.
     */
    const setMoveTab = (key: string) => {
        CookieHelper.set(`panel${props.index}activeMoveTabKey`, key)
        setActiveMoveTabKey(key)
    }

    return (
        <Tabs
            className="tabpane-small"
            id="movesTabs"
            transition={false}
            activeKey={activeMoveTabKey}
            defaultActiveKey="moves"
            onSelect={(k: string) => setMoveTab(k)}>
            <Tab eventKey="locations" title="Capture Locations">
                {renderCaptureLocations()}
            </Tab>

            <Tab eventKey="moves" title="Moves">
                {renderMoveList()}
            </Tab>

            <Tab eventKey="evolution" title="Evolution">
                {renderEvolutionChain()}
            </Tab>
        </Tabs>
    )
}
