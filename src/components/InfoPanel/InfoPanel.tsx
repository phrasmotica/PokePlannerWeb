import React, { useState } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { AbilityList } from "../AbilityList/AbilityList"
import { EfficacyList } from "../EfficacyList/EfficacyList"
import { FlavourTextList } from "../FlavourTextList/FlavourTextList"
import { HeldItemList } from "../HeldItemList/HeldItemList"
import { StatGraph } from "../StatGraph/StatGraph"

import { getBaseStats, getDisplayNameOfStat, typeIsConcrete } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonSpeciesEntry,
    StatInfo,
    TypeEntry,
    TypeInfo,
    VarietyAbilityInfo,
    VersionGroupInfo,
    VersionInfo
} from "../../models/swagger"
import { SpeciesInfo } from "../../models/SpeciesInfo"

interface InfoPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * The versions.
     */
    versions: VersionInfo[]

    /**
     * The species.
     */
    species: PokemonSpeciesEntry | undefined

    speciesInfo: SpeciesInfo

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
    types: TypeInfo[]

    /**
     * The base stats.
     */
    baseStats: StatInfo[]

    /**
     * Whether to show info about the Pokemon.
     */
    shouldShowPokemon: boolean
}

/**
 * Renders base stats, type efficacy, abilities, flavour text, etc.
 */
export const InfoPanel = (props: InfoPanelProps) => {
    const [activeInfoTabKey, setActiveInfoTabKey] = useState<string>()

    const flavourTextList = (
        <FlavourTextList
            index={props.index}
            species={props.species}
            versions={props.versions}
            showFlavourText={props.shouldShowPokemon} />
    )

    let abilities: VarietyAbilityInfo[] = []
    if (props.species !== undefined) {
        let selectedSpeciesInfo = props.speciesInfo.getById(props.species.pokemonSpeciesId)
        let varietyInfo = selectedSpeciesInfo!.varieties.find(v => v.id === props.pokemon?.pokemonId)
        abilities = varietyInfo?.abilities ?? []
    }

    const abilityList = (
        <AbilityList
            index={props.index}
            abilities={abilities}
            loading={false}
            showAbilities={props.shouldShowPokemon} />
    )

    const renderStatsGraph = () => {
        let baseStats: number[] = []

        if (props.pokemon !== undefined) {
            if (props.versionGroup === undefined) {
                throw new Error(`Panel ${props.index}: version group is undefined!`)
            }

            baseStats = getBaseStats(props.pokemon, props.versionGroup)
        }

        return (
            <StatGraph
                index={props.index}
                statNames={props.baseStats.map(getDisplayNameOfStat)}
                statValues={baseStats}
                shouldShowStats={props.shouldShowPokemon} />
        )
    }

    const efficacyList = (
        <EfficacyList
            index={props.index}
            typeIds={props.effectiveTypes.map(type => type.typeId)}
            types={props.types.filter(typeIsConcrete)}
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

    return (
        <div>
            <Tabs
                className="tabpane-small"
                transition={false}
                activeKey={activeInfoTabKey}
                defaultActiveKey="flavourText"
                onSelect={(k: string) => setActiveInfoTabKey(k)}
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
