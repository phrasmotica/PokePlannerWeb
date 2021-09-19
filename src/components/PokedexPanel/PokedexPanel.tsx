import React, { useEffect, useState } from "react"

import { ActionPanel } from "../ActionPanel/ActionPanel"
import { InfoPanel } from "../InfoPanel/InfoPanel"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"

import { IHasHideTooltips } from "../CommonMembers"

import { getEffectiveTypes } from "../../models/Helpers"

import {
    FormInfo,
    GenerationInfo,
    PokemonFormSprites,
    PokemonSpeciesInfo,
    PokemonSprites,
    StatInfo,
    TypeInfo,
    VarietyInfo,
    VersionGroupInfo
} from "../../models/swagger"

import "./PokedexPanel.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"
import { SpeciesInfo } from "../../models/SpeciesInfo"

interface PokedexPanelProps extends IHasHideTooltips {
    index: number

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
    const [species, setSpecies] = useState<PokemonSpeciesInfo>()
    const [variety, setVariety] = useState<VarietyInfo>()
    const [varietySprites, setVarietySprites] = useState<PokemonSprites>()
    const [form, setForm] = useState<FormInfo>()
    const [formSprites, setFormSprites] = useState<PokemonFormSprites>()

    const [showShinySprite, setShowShinySprite] = useState(false)

    const fetchVarietySprites = (varietyId: number) => {
        fetch(`${process.env.REACT_APP_API_URL}/sprite/variety/${varietyId}`)
            .then(response => response.json())
            .catch(error => console.log(error))
            .then((sprites: PokemonSprites) => setVarietySprites(sprites))
    }

    const fetchFormSprites = (formId: number) => {
        fetch(`${process.env.REACT_APP_API_URL}/sprite/form/${formId}`)
            .then(response => response.json())
            .catch(error => console.log(error))
            .then((sprites: PokemonFormSprites) => setFormSprites(sprites))
    }

    useEffect(() => {
        if (species !== undefined && species.varieties.length > 0) {
            setVariety(species.varieties[0])
        }

        return () => setVariety(undefined)
    }, [species, setVariety])

    useEffect(() => {
        if (variety !== undefined) {
            fetchVarietySprites(variety.id)

            if (variety.forms.length > 0) {
                setForm(variety.forms[0])
            }
        }

        return () => {
            setForm(undefined)
            setVarietySprites(undefined)
        }
    }, [variety, setForm])

    useEffect(() => {
        if (form !== undefined) {
            fetchFormSprites(form.id)
        }

        return () => setFormSprites(undefined)
    }, [form, setFormSprites])

    let shouldShowPokemon = species !== undefined && form !== undefined

    let effectiveTypes = getEffectiveTypes(variety, form)

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
                    species={species}
                    setSpecies={setSpecies}
                    variety={variety}
                    varietySprites={varietySprites}
                    setVariety={setVariety}
                    form={form}
                    formSprites={formSprites}
                    setForm={setForm}
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
