import React, { Component } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasCommon } from "../CommonMembers"

import { AbilityList } from "../AbilityList/AbilityList"
import { CaptureLocations } from "../CaptureLocations/CaptureLocations"
import { EfficacyList } from "../EfficacyList/EfficacyList"
import { StatGraph } from "../StatGraph/StatGraph"

import { PokemonEntry } from "../../models/PokemonEntry"
import { Type } from "../../models/Type"
import { TypesPresenceMap } from "../../models/TypesPresenceMap"

import { CookieHelper } from "../../util/CookieHelper"

interface IInfoPanelProps extends IHasCommon {
    /**
     * The Pokemon.
     */
    pokemon: PokemonEntry | undefined

    /**
     * The effective types.
     */
    effectiveTypes: Type[]

    /**
     * The types presence map.
     */
    typesPresenceMap: TypesPresenceMap

    /**
     * The names of the base stats to display.
     */
    baseStatNames: string[]

    /**
     * Whether to show info about the Pokemon.
     */
    shouldShowPokemon: boolean
}

interface IInfoPanelState {
    /**
     * The key of the active info tab.
     */
    activeInfoTabKey: string | undefined
}

/**
 * Component for displaying base stats, type efficacy, abilities, flavour text, etc.
 */
export class InfoPanel extends Component<IInfoPanelProps, IInfoPanelState> {
    constructor(props: IInfoPanelProps) {
        super(props)
        this.state = {
            activeInfoTabKey: CookieHelper.get(`panel${this.props.index}activeInfoTabKey`)
        }
    }
    /**
     * Renders the component.
     */
    render() {
        return (
            <div>
                <Tabs
                    className="tabpane-small"
                    transition={false}
                    activeKey={this.state.activeInfoTabKey}
                    defaultActiveKey="abilities"
                    onSelect={(k: string) => this.setActiveInfoTabKey(k)}
                    id="infoTabs">
                    <Tab eventKey="abilities" title="Abilities">
                        {this.renderAbilityList()}
                    </Tab>

                    <Tab eventKey="stats" title="Base Stats">
                        {this.renderStatsGraph()}
                    </Tab>

                    <Tab eventKey="efficacy" title="Efficacy">
                        {this.renderEfficacyList()}
                    </Tab>

                    <Tab eventKey="locations" title="Capture Locations">
                        {this.renderCaptureLocations()}
                    </Tab>
                </Tabs>
            </div>
        )
    }

    /**
     * Renders the Pokemon's abilities.
     */
    renderAbilityList() {
        return (
            <AbilityList
                index={this.props.index}
                pokemonId={this.props.pokemon?.pokemonId}
                showAbilities={this.props.shouldShowPokemon} />
        )
    }

    // returns a graph of the Pokemon's base stats
    renderStatsGraph() {
        let baseStats: number[] = []

        let pokemon = this.props.pokemon
        if (pokemon !== undefined) {
            let versionGroupId = this.props.versionGroupId
            if (versionGroupId === undefined) {
                throw new Error(`Panel ${this.props.index}: version group ID is undefined!`)
            }

            baseStats = pokemon.getBaseStats(versionGroupId)
        }

        return (
            <StatGraph
                index={this.props.index}
                statNames={this.props.baseStatNames}
                statValues={baseStats}
                shouldShowStats={this.props.shouldShowPokemon} />
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        let types = this.props.effectiveTypes

        return (
            <EfficacyList
                index={this.props.index}
                typeIds={types.map(type => type.id)}
                typesPresenceMap={this.props.typesPresenceMap}
                versionGroupId={this.props.versionGroupId}
                showMultipliers={this.props.shouldShowPokemon}
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
                pokemonId={this.props.pokemon?.pokemonId}
                versionGroupId={this.props.versionGroupId}
                showLocations={this.props.shouldShowPokemon}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    /**
     * Sets the key of the active info tab.
     */
    setActiveInfoTabKey(key: string) {
        CookieHelper.set(`panel${this.props.index}activeInfoTabKey`, key)
        this.setState({ activeInfoTabKey: key })
    }
}