import React, { useState } from "react"

import { ActionPanel } from "../ActionPanel/ActionPanel"
import { InfoPanel } from "../InfoPanel/InfoPanel"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { getEffectiveTypes, pokemonIsValid } from "../../models/Helpers"

import {
    GenerationEntry,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    StatEntry,
    TypeEntry,
    VersionGroupEntry
} from "../../models/swagger"

import "./PokedexPanel.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"

interface PokedexPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * List of types.
     */
    types: TypeEntry[]

    /**
     * The base stats.
     */
    baseStats: StatEntry[]

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

/**
 * Renders a Pokemon and information about it.
 */
export const PokedexPanel = (props: PokedexPanelProps) => {
    const [species, setSpecies] = useState<PokemonSpeciesEntry>()
    const [variety, setVariety] = useState<PokemonEntry>()
    const [form, setForm] = useState<PokemonFormEntry>()
    const [showShinySprite, setShowShinySprite] = useState(false)

    console.log("PokedexPanel RENDER")
    console.log(species)
    console.log(variety)
    console.log(form)

    const hasSpecies = species !== undefined
    const selectedPokemonIsValid = !hasSpecies || pokemonIsValid(
        species!, form, props.versionGroup?.versionGroupId
    )

    let effectiveTypes = getEffectiveTypes(
        variety, form, props.versionGroup?.versionGroupId
    )

    const shouldShowPokemon = hasSpecies
            && form !== undefined
            && (props.ignoreValidity || selectedPokemonIsValid)

    const setSpeciesAndCascade = (species: PokemonSpeciesEntry | undefined) => {
        setSpecies(species)

        if (species === undefined) {
            setVariety(undefined)
            setForm(undefined)
        }

        // TODO: set default variety and form of selected species to fix shouldShowPokemon bug
    }

    return (
        <div className="flex pokedex-panel debug-border">
            <div className="debug-border whalf">
                <PokemonPanel
                    index={props.index}
                    versionGroupId={props.versionGroup?.versionGroupId}
                    speciesList={props.species}
                    defaultSpeciesId={species?.pokemonSpeciesId}
                    generations={props.generations}
                    types={props.types}
                    baseStats={props.baseStats}
                    hideTooltips={props.hideTooltips}
                    ignoreValidity={props.ignoreValidity}
                    species={species}
                    setSpecies={setSpeciesAndCascade}
                    variety={variety}
                    setVariety={setVariety}
                    form={form}
                    setForm={setForm}
                    toggleShowShinySprite={() => setShowShinySprite(!showShinySprite)}
                    toggleIgnoreValidity={props.toggleIgnoreValidity} />

                <div className="debug-border hhalf" style={{ fontSize: "10pt" }}>
                    <InfoPanel
                        index={props.index}
                        versionGroup={props.versionGroup}
                        hideTooltips={props.hideTooltips}
                        versions={props.versionGroup?.versions ?? []}
                        species={species}
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
                    species={props.species}
                    pokemonSpeciesId={species?.pokemonSpeciesId}
                    variety={variety}
                    form={form}
                    shouldShowPokemon={shouldShowPokemon}
                    showShinySprite={showShinySprite}
                    setSpecies={setSpeciesAndCascade} />
            </div>
        </div>
    )
}
