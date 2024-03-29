import React, { useState } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { CaptureLocations } from "../CaptureLocations/CaptureLocations"
import { EvolutionChain } from "../EvolutionChain/EvolutionChain"
import { MoveList } from "../MoveList/MoveList"

import { getEffectiveTypes } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    FormInfo,
    PokemonSpeciesInfo,
    VarietyInfo,
    VersionGroupInfo
} from "../../models/swagger"

import "./ActionPanel.scss"

interface ActionPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * List of Pokemon species info.
     */
    speciesInfo: SpeciesInfo

    /**
     * The Pokemon species.
     */
    species: PokemonSpeciesInfo | undefined

    /**
     * The species variety.
     */
    variety: VarietyInfo | undefined

    /**
     * The Pokemon form.
     */
    form: FormInfo | undefined

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
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void
}

/**
 * Renders moves, evolution trees, encounters, etc.
 */
export const ActionPanel = (props: ActionPanelProps) => {
    const [activeMoveTabKey, setActiveMoveTabKey] = useState<string>()

    /**
     * Renders the move list.
     */
    const renderMoveList = () => {
        let typeIds = getEffectiveTypes(props.variety, props.form)

        return (
            <MoveList
                index={props.index}
                versionGroup={props.versionGroup}
                pokemonId={props.variety?.id}
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
                pokemonId={props.variety?.id}
                versionGroup={props.versionGroup}
                species={props.species}
                showLocations={props.shouldShowPokemon}
                hideTooltips={props.hideTooltips} />
        )
    }

    /**
     * Renders the evolution chain.
     */
    const renderEvolutionChain = () => (
        <div className="inherit-size">
            <EvolutionChain
                index={props.index}
                species={props.species}
                availableSpeciesIds={props.speciesInfo.getAllSpeciesIds()}
                showShinySprites={props.showShinySprite}
                shouldShowChain={props.shouldShowPokemon}
                setSpecies={props.setSpecies} />
        </div>
    )

    return (
        <Tabs
            className="tabpane-small"
            id="movesTabs"
            transition={false}
            activeKey={activeMoveTabKey}
            defaultActiveKey="moves"
            onSelect={(k: string) => setActiveMoveTabKey(k)}>
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
