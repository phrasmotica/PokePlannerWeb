import React from "react"

import { FormSelector } from "./FormSelector"
import { SpeciesSelector } from "./SpeciesSelector"
import { VarietySelector } from "./VarietySelector"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    FormInfo,
    GenerationInfo,
    PokemonSpeciesInfo,
    VarietyInfo,
    VersionGroupInfo,
} from "../../models/swagger"

import "../../styles/types.scss"
import "./PokemonSelector.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface PokemonSelectorProps {
    index: number
    versionGroup: VersionGroupInfo | undefined

    speciesInfo: SpeciesInfo

    loadingSpeciesInfo: boolean

    species: PokemonSpeciesInfo | undefined

    variety: VarietyInfo | undefined

    form: FormInfo | undefined

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

    /**
     * List of generations.
     */
    generations: GenerationInfo[]

    /**
     * The generation filter.
     */
    generationFilter: GenerationFilterModel

    /**
     * The type filter.
     */
    typeFilter: TypeFilterModel

    /**
     * The base stat filter.
     */
    baseStatFilter: BaseStatFilterModel

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: VarietyInfo | undefined) => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: FormInfo | undefined) => void
}

/**
 * Component for selecting a Pokemon.
 */
export const PokemonSelector = (props: PokemonSelectorProps) => {
    /**
     * Renders the species select box.
     */
    const renderSpeciesSelect = () => {
        return (
            <SpeciesSelector
                index={props.index}
                versionGroup={props.versionGroup}
                speciesInfo={props.speciesInfo}
                species={props.species}
                loading={props.loadingSpeciesInfo}
                generationFilter={props.generationFilter}
                typeFilter={props.typeFilter}
                baseStatFilter={props.baseStatFilter}
                setSpecies={props.setSpecies} />
        )
    }

    /**
     * Renders the variety select box.
     */
    const renderVarietySelect = () => (
        <VarietySelector
            index={props.index}
            versionGroup={props.versionGroup}
            species={props.species}
            variety={props.variety}
            setVariety={props.setVariety} />
    )

    /**
     * Renders the form select box.
     */
    const renderFormSelect = () => (
        <FormSelector
            index={props.index}
            versionGroup={props.versionGroup}
            variety={props.variety}
            form={props.form}
            setForm={props.setForm} />
    )

    return (
        <div className="margin-right">
            {renderSpeciesSelect()}
            {renderVarietySelect()}
            {renderFormSelect()}
        </div>
    )
}
