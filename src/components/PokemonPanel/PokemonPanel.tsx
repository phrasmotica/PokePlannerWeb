import React, { useEffect, useState } from "react"
import { FormGroup, CustomInput } from "reactstrap"
import key from "weak-key"

import { IHasCommon } from "../CommonMembers"

import { PokemonSelector } from "../PokemonSelector/PokemonSelector"
import { BaseStatFilterModel, BaseStatFilterValue } from "../SpeciesFilter/BaseStatFilterModel"
import { SpeciesFilter } from "../SpeciesFilter/SpeciesFilter"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStats, getDisplayName, getEffectiveTypes, getGenus, getTypes, hasDisplayNames, pokemonIsValid } from "../../models/Helpers"

import {
    GenerationInfo,
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry,
    PokemonSpeciesInfo,
    StatEntry,
    TypeInfo
} from "../../models/swagger"

import "./PokemonPanel.scss"

interface PokemonPanelProps extends IHasCommon {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

    speciesInfo: PokemonSpeciesInfo[]

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
    baseStats: StatEntry[]

    species: PokemonSpeciesEntry | undefined

    varieties: PokemonEntry[]

    setVarieties: (varieties: PokemonEntry[]) => void

    forms: PokemonFormEntry[]

    setForms: (forms: PokemonFormEntry[]) => void

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesEntry | undefined) => void

    variety: PokemonEntry | undefined

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: PokemonEntry | undefined) => void

    form: PokemonFormEntry | undefined

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: PokemonFormEntry | undefined) => void

    /**
     * Handler for toggling the shiny sprite.
     */
    toggleShowShinySprite: () => void

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
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
        // default to species display name
        let displayName = getDisplayName(props.species!, "en")

        let form = props.form
        if (form !== undefined && hasDisplayNames(form)) {
            displayName = getDisplayName(form, "en") ?? displayName
        }

        return displayName
    }

    const renderPokemonGenus = () => {
        let genusElement = "-"
        if (shouldShowPokemon()) {
            genusElement = getGenus(props.species!, "en") ?? "-"
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
            let types = getEffectiveTypes(
                props.variety,
                props.form,
                props.versionGroupId
            )

            typesElement = types.map(type => {
                return (
                    <div
                        key={key(type)}
                        className="flex-center fill-parent">
                        <img
                            key={key(type)}
                            className={"type-icon padded" + (shouldShowPokemon() ? "" : " hidden")}
                            alt={`type${type.typeId}`}
                            src={require(`../../images/typeIcons/${type.typeId}-small.png`)} />
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
            let dataObject = props.form ?? props.variety
            if (dataObject !== undefined) {
                spriteUrl = showShinySprite
                    ? dataObject.shinySpriteUrl
                    : dataObject.spriteUrl
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

    const hasSpecies = props.species !== undefined

    const selectedPokemonIsValid = () => pokemonIsValid(
        props.species!, props.form, props.versionGroupId
    )

    /**
     * Returns whether the Pokemon should be displayed.
     */
    const shouldShowPokemon = () => hasSpecies
            && props.form !== undefined
            && (props.ignoreValidity || selectedPokemonIsValid())

    const setGenerationFilterAndUpdate = (filter: GenerationFilterModel) => {
        setGenerationFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let generationId = props.species.generation.generationId

            let failsGenerationFilter = !filter.passesFilter([generationId])
            if (failsGenerationFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const setTypeFilterAndUpdate = (filter: TypeFilterModel) => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Pokemon panel ${props.index}: version group ID is undefined!`
            )
        }

        setTypeFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let speciesTypes = getTypes(props.species, versionGroupId).map(t => t.typeId)

            let failsTypeFilter = !filter.passesFilter(speciesTypes)
            if (failsTypeFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const setBaseStatFilterAndUpdate = (filter: BaseStatFilterModel) => {
        let versionGroupId = props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Pokemon panel ${props.index}: version group ID is undefined!`
            )
        }

        setBaseStatFilter(filter)

        // no longer have a valid species
        if (props.species !== undefined) {
            let speciesBaseStats = getBaseStats(props.species, versionGroupId)

            let failsBaseStatFilter = !filter.passesFilter(speciesBaseStats)
            if (failsBaseStatFilter) {
                props.setSpecies(undefined)
            }
        }
    }

    const speciesFilter = (
        <SpeciesFilter
            index={props.index}
            versionGroupId={props.versionGroupId}
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
                <PokemonSelector
                    index={props.index}
                    versionGroupId={props.versionGroupId}
                    speciesInfo={props.speciesInfo}
                    loadingSpeciesInfo={props.loadingSpeciesInfo}
                    defaultSpeciesId={props.defaultSpeciesId}
                    ignoreValidity={props.ignoreValidity}
                    generations={props.generations}
                    hideTooltips={props.hideTooltips}
                    species={props.species}
                    setSpecies={props.setSpecies}
                    variety={props.variety}
                    setVariety={props.setVariety}
                    varieties={props.varieties}
                    setVarieties={props.setVarieties}
                    form={props.form}
                    setForm={props.setForm}
                    forms={props.forms}
                    setForms={props.setForms}
                    generationFilter={generationFilter}
                    typeFilter={typeFilter}
                    baseStatFilter={baseStatFilter}
                    toggleIgnoreValidity={props.toggleIgnoreValidity}
                    toggleSpeciesFilter={() => setShowSpeciesFilter(!showSpeciesFilter)} />
            </div>

            <div className="flex-center w40 debug-border">
                {showSpeciesFilter ? speciesFilter : pokemonInfo}
            </div>
        </div>
    )
}
