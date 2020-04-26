import React, { Component } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { AbilityList } from "../AbilityList/AbilityList"
import { EfficacyList } from "../EfficacyList/EfficacyList"
import { FlavourTextList } from "../FlavourTextList/FlavourTextList"
import { StatGraph } from "../StatGraph/StatGraph"

import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { StatEntry } from "../../models/StatEntry"
import { Type } from "../../models/Type"
import { TypeEntry } from "../../models/TypeEntry"
import { VersionEntry } from "../../models/VersionEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"

import { CookieHelper } from "../../util/CookieHelper"
import { HeldItemList } from "../HeldItemList/HeldItemList"

interface IInfoPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * The versions.
     */
    versions: VersionEntry[]

    /**
     * The species.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * The Pokemon.
     */
    pokemon: PokemonEntry | undefined

    /**
     * The effective types.
     */
    effectiveTypes: Type[]

    /**
     * The types.
     */
    types: TypeEntry[]

    /**
     * The base stats.
     */
    baseStats: StatEntry[]

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
                    defaultActiveKey="flavourText"
                    onSelect={(k: string) => this.setActiveInfoTabKey(k)}
                    id="infoTabs">
                    <Tab eventKey="flavourText" title="Flavour Text">
                        {this.renderFlavourTextList()}
                    </Tab>

                    <Tab eventKey="abilities" title="Abilities">
                        {this.renderAbilityList()}
                    </Tab>

                    <Tab eventKey="stats" title="Base Stats">
                        {this.renderStatsGraph()}
                    </Tab>

                    <Tab eventKey="efficacy" title="Efficacy">
                        {this.renderEfficacyList()}
                    </Tab>

                    <Tab eventKey="heldItems" title="Held Items">
                        {this.renderHeldItems()}
                    </Tab>
                </Tabs>
            </div>
        )
    }

    /**
     * Renders the species' flavour text entries.
     */
    renderFlavourTextList() {
        return (
            <FlavourTextList
                index={this.props.index}
                species={this.props.species}
                versions={this.props.versions}
                showFlavourText={this.props.shouldShowPokemon} />
        )
    }

    /**
     * Renders the Pokemon's abilities.
     */
    renderAbilityList() {
        return (
            <AbilityList
                index={this.props.index}
                versionGroupId={this.props.versionGroup?.versionGroupId}
                pokemonId={this.props.pokemon?.pokemonId}
                showAbilities={this.props.shouldShowPokemon} />
        )
    }

    // returns a graph of the Pokemon's base stats
    renderStatsGraph() {
        let baseStats: number[] = []

        let pokemon = this.props.pokemon
        if (pokemon !== undefined) {
            let versionGroupId = this.props.versionGroup?.versionGroupId
            if (versionGroupId === undefined) {
                throw new Error(`Panel ${this.props.index}: version group ID is undefined!`)
            }

            baseStats = pokemon.getBaseStats(versionGroupId)
        }

        return (
            <StatGraph
                index={this.props.index}
                statNames={this.props.baseStats.map(s => s.getDisplayName("en") ?? "stat")}
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
                types={this.props.types}
                versionGroup={this.props.versionGroup}
                showMultipliers={this.props.shouldShowPokemon}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    /**
     * Renders the held items.
     */
    renderHeldItems() {
        return (
            <HeldItemList
                index={this.props.index}
                versionGroup={this.props.versionGroup}
                pokemon={this.props.pokemon}
                showHeldItems={this.props.shouldShowPokemon} />
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