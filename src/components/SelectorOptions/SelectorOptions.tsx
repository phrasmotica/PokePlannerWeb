import React from "react"
import { Button } from "reactstrap"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import { PokemonSpeciesInfo } from "../../models/swagger"

import "./SelectorOptions.scss"

interface SelectorOptionsProps {
    speciesInfo: SpeciesInfo
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void
    filterOpen: boolean
    toggleSpeciesFilter: () => void
}

export const SelectorOptions = (props: SelectorOptionsProps) => {
    const setRandomSpecies = () => {
        let species = props.speciesInfo.getRandom()
        props.setSpecies(species)
    }

    return (
        <div className="flex">
            <Button
                block
                size="sm"
                color={props.filterOpen ? "success" : "info"}
                onClick={props.toggleSpeciesFilter}>
                Filter
            </Button>

            <Button
                block
                size="sm"
                color="warning"
                onClick={setRandomSpecies}>
                Random
            </Button>

            <Button
                block
                size="sm"
                color="danger"
                onClick={() => props.setSpecies(undefined)}>
                Clear
            </Button>
        </div>
    )
}
