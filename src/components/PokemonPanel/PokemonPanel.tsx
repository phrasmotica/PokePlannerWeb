import React, { useEffect, useState } from "react"
import { FormGroup, CustomInput } from "reactstrap"

import { PokemonSelector } from "../PokemonSelector/PokemonSelector"
import { SelectorOptions } from "../SelectorOptions/SelectorOptions"
import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { SpeciesFilter } from "../SpeciesFilter/SpeciesFilter"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStatsOfSpecies, getDisplayNameOfForm, getDisplayNameOfSpecies, getEffectiveTypes, getGenus, getTypesOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

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

import "./PokemonPanel.scss"

interface PokemonPanelProps {
    index: number

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

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

    species: PokemonSpeciesInfo | undefined

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void

    variety: VarietyInfo | undefined
    varietySprites: PokemonSprites | undefined

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: VarietyInfo | undefined) => void

    form: FormInfo | undefined
    formSprites: PokemonFormSprites | undefined

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: FormInfo | undefined) => void

    /**
     * Handler for toggling the shiny sprite.
     */
    toggleShowShinySprite: () => void
}

/**
 * Renders a Pokemon and basic information about it.
 */
export const PokemonPanel = (props: PokemonPanelProps) => {
    const [generationFilter, setGenerationFilter] = useState(new GenerationFilterModel())
    const [typeFilter, setTypeFilter] = useState(new TypeFilterModel())
    const [baseStatFilter, setBaseStatFilter] = useState(BaseStatFilterModel.createEmpty(0))

    const [showShinySprite, setShowShinySprite] = useState(false)
    const [showSpeciesFilter, setShowSpeciesFilter] = useState(false)

    useEffect(() => {
        setBaseStatFilter(BaseStatFilterModel.createEmpty(props.baseStats.length))
        return () => setBaseStatFilter(BaseStatFilterModel.createEmpty(0))
    }, [props.baseStats])

    const renderPokemonName = () => {
        let displayNameElement = "-"
        if (shouldShowPokemon()) {
            displayNameElement = getEffectiveDisplayName() ?? "-"
        }

        return (
            <div className="pokemonName center-text">
                {displayNameElement}
            </div>
        )
    }

    const getEffectiveDisplayName = () => {
        let displayName = "???"

        if (props.species !== undefined) {
            // default to species display name
            displayName = getDisplayNameOfSpecies(props.species)

            if (props.form !== undefined) {
                let formName = getDisplayNameOfForm(props.form)
                if (formName.length > 0) {
                    displayName = formName
                }
            }
        }

        return displayName
    }

    const renderPokemonGenus = () => {
        let genusElement = "-"
        if (shouldShowPokemon()) {
            genusElement = getGenus(props.species!)
        }

        return (
            <div className="pokemonGenus center-text">
                {genusElement}
            </div>
        )
    }

    const renderPokemonTypes = () => {
        let typesElement: any = "-"
        if (shouldShowPokemon()) {
            let types = getEffectiveTypes(props.variety, props.form)

            typesElement = types.map(type => {
                return (
                    <div
                        key={type}
                        className="flex-center fill-parent">
                        <img
                            key={type}
                            className={"type-icon padded" + (shouldShowPokemon() ? "" : " hidden")}
                            alt={`type${type}`}
                            src={require(`../../images/typeIcons/${type}-small.png`)} />
                    </div>
                )
            })
        }

        return (
            <div className="flex-center type-pair">
                {typesElement}
            </div>
        )
    }

    const renderPokemonSprite = () => {
        let spriteUrl = ""
        if (shouldShowPokemon()) {
            let dataObject = props.formSprites ?? props.varietySprites
            if (dataObject !== undefined) {
                spriteUrl = (showShinySprite
                    ? dataObject.frontShiny
                    : dataObject.frontDefault) ?? ""
            }

            if (!spriteUrl) {
                return (
                    <div className="flex-center sprite-large margin-auto-horiz">
                        (no sprite)
                    </div>
                )
            }
        }

        return (
            <div className="sprite-large margin-auto-horiz">
                <img
                    className={"inherit-size" + (shouldShowPokemon() ? "" : " hidden")}
                    alt={`sprite${props.index}`}
                    src={spriteUrl} />
            </div>
        )
    }

    const shinySpriteSwitch = (
        <FormGroup
            className="flex-center"
            style={{ marginBottom: 0 }}>
            <CustomInput
                type="switch"
                id={"toggleShinySpriteSwitch" + props.index}
                checked={showShinySprite}
                label={showShinySprite ? "Shiny" : "Default"}
                onChange={() => toggleShowShinySprite()} />
        </FormGroup>
    )

    const toggleShowShinySprite = () => {
        setShowShinySprite(!showShinySprite)
        props.toggleShowShinySprite()
    }

    /**
     * Returns whether the Pokemon should be displayed.
     */
    const shouldShowPokemon = () => props.species !== undefined && props.form !== undefined

    const setGenerationFilterAndUpdate = (filter: GenerationFilterModel) => {
        setGenerationFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let generationId = props.species.generationId

            let failsGenerationFilter = !filter.passesFilter([generationId])
            if (failsGenerationFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const setTypeFilterAndUpdate = (filter: TypeFilterModel) => {
        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            throw new Error(
                `Pokemon panel ${props.index}: version group is undefined!`
            )
        }

        setTypeFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let speciesTypes = getTypesOfSpecies(props.species)

            let failsTypeFilter = !filter.passesFilter(speciesTypes)
            if (failsTypeFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const setBaseStatFilterAndUpdate = (filter: BaseStatFilterModel) => {
        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            throw new Error(
                `Pokemon panel ${props.index}: version group is undefined!`
            )
        }

        setBaseStatFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let speciesBaseStats = getBaseStatsOfSpecies(props.species)

            let failsBaseStatFilter = !filter.passesFilter(speciesBaseStats)
            if (failsBaseStatFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const speciesFilter = (
        <SpeciesFilter
            index={props.index}
            species={props.speciesInfo}
            generations={props.generations}
            generationFilter={generationFilter}
            types={props.types}
            typeFilter={typeFilter}
            baseStats={props.baseStats}
            baseStatFilter={baseStatFilter}
            setGenerationFilter={filter => setGenerationFilterAndUpdate(filter)}
            setTypeFilter={filter => setTypeFilterAndUpdate(filter)}
            setBaseStatFilter={filter => setBaseStatFilterAndUpdate(filter)} />
    )

    const pokemonInfo = (
        <div>
            <div className="margin-bottom-small">
                {renderPokemonName()}
                {renderPokemonGenus()}
            </div>

            <div>
                {renderPokemonTypes()}
                {renderPokemonSprite()}
                {shinySpriteSwitch}
            </div>
        </div>
    )

    return (
        <div className="flex debug-border hhalf">

            <div className="flex-center w60 debug-border">
                <div>
                    <div className="margin-bottom">
                        <SelectorOptions
                            speciesInfo={props.speciesInfo}
                            setSpecies={props.setSpecies}
                            filterOpen={showSpeciesFilter}
                            toggleSpeciesFilter={() => setShowSpeciesFilter(!showSpeciesFilter)} />
                    </div>

                    <PokemonSelector
                        index={props.index}
                        versionGroup={props.versionGroup}
                        speciesInfo={props.speciesInfo}
                        loadingSpeciesInfo={props.loadingSpeciesInfo}
                        defaultSpeciesId={props.defaultSpeciesId}
                        generations={props.generations}
                        species={props.species}
                        setSpecies={props.setSpecies}
                        variety={props.variety}
                        setVariety={props.setVariety}
                        form={props.form}
                        setForm={props.setForm}
                        generationFilter={generationFilter}
                        typeFilter={typeFilter}
                        baseStatFilter={baseStatFilter} />
                </div>
            </div>

            <div className="flex-center w40 debug-border">
                {showSpeciesFilter ? speciesFilter : pokemonInfo}
            </div>
        </div>
    )
}
