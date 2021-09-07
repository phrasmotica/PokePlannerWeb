import React, { useEffect, useState } from "react"

import { ActionPanel } from "../ActionPanel/ActionPanel"
import { InfoPanel } from "../InfoPanel/InfoPanel"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { getEffectiveTypes, pokemonIsValid } from "../../models/Helpers"

import {
    GenerationInfo,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    StatInfo,
    TypeInfo,
    VersionGroupInfo
} from "../../models/swagger"

import "./PokedexPanel.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"
import { SpeciesInfo } from "../../models/SpeciesInfo"

interface PokedexPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    speciesInfo: SpeciesInfo

    loadingSpeciesInfo: boolean

    /**
     * List of generations.
     */
    generations: GenerationInfo[]

    /**
     * List of types.
     */
    types: TypeInfo[]

    /**
     * The base stats.
     */
    baseStats: StatInfo[]
}

/**
 * Renders a Pokemon and information about it.
 */
export const PokedexPanel = (props: PokedexPanelProps) => {
    // TODO: replace with the ID of the selected species, so we can
    // find it in props.speciesInfo and use its data exclusively
    const [species, setSpecies] = useState<PokemonSpeciesEntry>()

    const [variety, setVariety] = useState<PokemonEntry>()
    const [varieties, setVarieties] = useState<PokemonEntry[]>([])

    const [form, setForm] = useState<PokemonFormEntry>()
    const [forms, setForms] = useState<PokemonFormEntry[]>([])

    const [showShinySprite, setShowShinySprite] = useState(false)

    useEffect(() => {
        if (varieties.length > 0) {
            setVariety(varieties[0])
        }

        return () => setVariety(undefined)
    }, [varieties, setVariety])

    useEffect(() => {
        if (forms.length > 0) {
            setForm(forms[0])
        }

        return () => setForm(undefined)
    }, [forms, setForm])

    const hasSpecies = species !== undefined
    const selectedPokemonIsValid = !hasSpecies || pokemonIsValid(
        species!, form, props.versionGroup
    )

    let effectiveTypes = getEffectiveTypes(
        variety, form, props.versionGroup
    )

    const shouldShowPokemon = hasSpecies
            && form !== undefined
            && selectedPokemonIsValid

    return (
        <div className="flex pokedex-panel debug-border">
            <div className="debug-border whalf">
                <PokemonPanel
                    index={props.index}
                    versionGroup={props.versionGroup}
                    speciesInfo={props.speciesInfo}
                    loadingSpeciesInfo={props.loadingSpeciesInfo}
                    defaultSpeciesId={species?.pokemonSpeciesId}
                    generations={props.generations}
                    types={props.types}
                    baseStats={props.baseStats}
                    hideTooltips={props.hideTooltips}
                    species={species}
                    setSpecies={setSpecies}
                    variety={variety}
                    setVariety={setVariety}
                    varieties={varieties}
                    setVarieties={setVarieties}
                    form={form}
                    setForm={setForm}
                    forms={forms}
                    setForms={setForms}
                    toggleShowShinySprite={() => setShowShinySprite(!showShinySprite)} />

                <div className="debug-border hhalf" style={{ fontSize: "10pt" }}>
                    <InfoPanel
                        index={props.index}
                        versionGroup={props.versionGroup}
                        hideTooltips={props.hideTooltips}
                        versions={props.versionGroup?.versionInfo ?? []}
                        species={species}
                        speciesInfo={props.speciesInfo}
                        pokemon={variety}
                        effectiveTypes={effectiveTypes}
                        types={props.types}
                        baseStats={props.baseStats}
                        shouldShowPokemon={shouldShowPokemon} />
                </div>
            </div>

            <div className="debug-border whalf flex-down" style={{ fontSize: "10pt" }}>
                <ActionPanel
                    index={props.index}
                    versionGroup={props.versionGroup}
                    hideTooltips={props.hideTooltips}
                    speciesInfo={props.speciesInfo}
                    species={species}
                    variety={variety}
                    form={form}
                    shouldShowPokemon={shouldShowPokemon}
                    showShinySprite={showShinySprite}
                    setSpecies={setSpecies} />
            </div>
        </div>
    )
}
