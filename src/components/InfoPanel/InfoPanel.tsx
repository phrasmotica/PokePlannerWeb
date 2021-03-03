import React, { useState } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { AbilityList } from "../AbilityList/AbilityList"
import { EfficacyList } from "../EfficacyList/EfficacyList"
import { FlavourTextList } from "../FlavourTextList/FlavourTextList"
import { HeldItemList } from "../HeldItemList/HeldItemList"
import { StatGraph } from "../StatGraph/StatGraph"

import { getBaseStats, getDisplayName } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonSpeciesEntry,
    StatEntry,
    TypeEntry,
    VersionEntry,
    VersionGroupEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

interface InfoPanelProps extends IHasIndex, IHasHideTooltips {
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
    effectiveTypes: TypeEntry[]

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

/**
 * Renders base stats, type efficacy, abilities, flavour text, etc.
 */
export const InfoPanel = (props: InfoPanelProps) => {
    const [activeInfoTabKey, setActiveInfoTabKey] = useState<string | undefined>(
        CookieHelper.get(`panel${props.index}activeInfoTabKey`)
    )

    const flavourTextList = (
        <FlavourTextList
            index={props.index}
            species={props.species}
            versions={props.versions}
            showFlavourText={props.shouldShowPokemon} />
    )

    const abilityList = (
        <AbilityList
            index={props.index}
            versionGroupId={props.versionGroup?.versionGroupId}
            pokemonId={props.pokemon?.pokemonId}
            showAbilities={props.shouldShowPokemon} />
    )

    const renderStatsGraph = () => {
        let baseStats: number[] = []

        let pokemon = props.pokemon
        if (pokemon !== undefined) {
            let versionGroupId = props.versionGroup?.versionGroupId
            if (versionGroupId === undefined) {
                throw new Error(`Panel ${props.index}: version group ID is undefined!`)
            }

            baseStats = getBaseStats(pokemon, versionGroupId)
        }

        return (
            <StatGraph
                index={props.index}
                statNames={props.baseStats.map(s => getDisplayName(s, "en") ?? s.name)}
                statValues={baseStats}
                shouldShowStats={props.shouldShowPokemon} />
        )
    }

    const efficacyList = (
        <EfficacyList
            index={props.index}
            typeIds={props.effectiveTypes.map(type => type.typeId)}
            types={props.types}
            versionGroup={props.versionGroup}
            showMultipliers={props.shouldShowPokemon}
            hideTooltips={props.hideTooltips} />
    )

    const heldItems = (
        <HeldItemList
            index={props.index}
            versionGroup={props.versionGroup}
            pokemon={props.pokemon}
            showHeldItems={props.shouldShowPokemon} />
    )

    /**
     * Sets the key of the active info tab.
     */
    const setInfoTab = (key: string) => {
        CookieHelper.set(`panel${props.index}activeInfoTabKey`, key)
        setActiveInfoTabKey(key)
    }

    return (
        <div>
            <Tabs
                className="tabpane-small"
                transition={false}
                activeKey={activeInfoTabKey}
                defaultActiveKey="flavourText"
                onSelect={(k: string) => setInfoTab(k)}
                id="infoTabs">
                <Tab eventKey="flavourText" title="Flavour Text">
                    {flavourTextList}
                </Tab>

                <Tab eventKey="abilities" title="Abilities">
                    {abilityList}
                </Tab>

                <Tab eventKey="stats" title="Base Stats">
                    {renderStatsGraph()}
                </Tab>

                <Tab eventKey="efficacy" title="Efficacy">
                    {efficacyList}
                </Tab>

                <Tab eventKey="heldItems" title="Held Items">
                    {heldItems}
                </Tab>
            </Tabs>
        </div>
    )
}
