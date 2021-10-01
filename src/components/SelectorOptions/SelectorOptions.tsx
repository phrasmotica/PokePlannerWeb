import React from "react"
import { Button } from "semantic-ui-react"

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

    const clearSpecies = () => props.setSpecies(undefined)

    return (
        <div className="flex">
            <Button
                size="small"
                color={props.filterOpen ? "green" : "blue"}
                onClick={props.toggleSpeciesFilter}>
                Filter
            </Button>

            <Button
                size="small"
                color="yellow"
                onClick={setRandomSpecies}>
                Random
            </Button>

            <Button
                size="small"
                color="red"
                onClick={clearSpecies}>
                Clear
            </Button>
        </div>
    )
}
