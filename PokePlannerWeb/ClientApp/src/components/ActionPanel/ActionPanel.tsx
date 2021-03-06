import React, { Component } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { CaptureLocations } from "../CaptureLocations/CaptureLocations"
import { EvolutionChain } from "../EvolutionChain/EvolutionChain"
import { MoveList } from "../MoveList/MoveList"

import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"

import { PokemonHelper } from "../../util/PokemonHelper"
import { CookieHelper } from "../../util/CookieHelper"

import "./ActionPanel.scss"

interface IActionPanelProps extends IHasIndex, IHasHideTooltips {
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
    speciesId: number | undefined

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
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number | undefined) => void
}

interface IActionPanelState {
    /**
     * The key of the active move tab.
     */
    activeMoveTabKey: string | undefined
}

/**
 * Component for displaying moves, evolution trees, encounters, etc.
 */
export class ActionPanel extends Component<IActionPanelProps, IActionPanelState> {
    /**
     * Constructor.
     */
    constructor(props: IActionPanelProps) {
        super(props)
        this.state = {
            activeMoveTabKey: CookieHelper.get(`panel${this.props.index}activeMoveTabKey`)
        }
    }

    /**
     * Renders the component.
     */
    render() {
        return (
            <Tabs
                className="tabpane-small"
                id="movesTabs"
                transition={false}
                activeKey={this.state.activeMoveTabKey}
                defaultActiveKey="moves"
                onSelect={(k: string) => this.setActiveMoveTabKey(k)}>
                <Tab eventKey="locations" title="Capture Locations">
                    {this.renderCaptureLocations()}
                </Tab>

                <Tab eventKey="moves" title="Moves">
                    {this.renderMoveList()}
                </Tab>

                <Tab eventKey="evolution" title="Evolution">
                    {this.renderEvolutionChain()}
                </Tab>
            </Tabs>
        )
    }

    /**
     * Renders the move list.
     */
    renderMoveList() {
        let typeIds = this.getEffectiveTypes().map(t => t.id)

        return (
            <MoveList
                index={this.props.index}
                versionGroupId={this.props.versionGroup?.versionGroupId}
                pokemonId={this.props.variety?.pokemonId}
                typeIds={typeIds}
                showMoves={this.props.shouldShowPokemon}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    /**
     * Renders the capture locations.
     */
    renderCaptureLocations() {
        return (
            <CaptureLocations
                index={this.props.index}
                pokemonId={this.props.variety?.pokemonId}
                versionGroup={this.props.versionGroup}
                species={this.getSpecies()}
                showLocations={this.props.shouldShowPokemon}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    /**
     * Returns the data object for the selected species.
     */
    getSpecies() {
        let speciesId = this.props.speciesId
        return this.props.species.find(s => s.speciesId === speciesId)
    }

    /**
     * Returns the Pokemon's effective types.
     */
    getEffectiveTypes() {
        return PokemonHelper.getEffectiveTypes(
            this.props.variety,
            this.props.form,
            this.props.versionGroup?.versionGroupId
        )
    }

    /**
     * Renders the evolution chain.
     */
    renderEvolutionChain() {
        const setSpecies = (speciesId: number) => this.props.setSpecies(speciesId)

        return (
            <div className="inherit-size">
                <EvolutionChain
                    index={this.props.index}
                    speciesId={this.props.speciesId}
                    availableSpeciesIds={this.props.species.map(s => s.speciesId)}
                    showShinySprites={this.props.showShinySprite}
                    shouldShowChain={this.props.shouldShowPokemon}
                    setSpecies={setSpecies} />
            </div>
        )
    }

    /**
     * Sets the key of the active move tab.
     */
    setActiveMoveTabKey(key: string) {
        CookieHelper.set(`panel${this.props.index}activeMoveTabKey`, key)
        this.setState({ activeMoveTabKey: key })
    }
}