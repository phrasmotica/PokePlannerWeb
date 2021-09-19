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

    return (
        <div className="flex">
            <Button
                block
                size="small"
                color={props.filterOpen ? "green" : "blue"}
                onClick={props.toggleSpeciesFilter}>
                Filter
            </Button>

            <Button
                block
                size="small"
                color="yellow"
                onClick={setRandomSpecies}>
                Random
            </Button>

            <Button
                block
                size="small"
                color="red"
                onClick={() => props.setSpecies(undefined)}>
                Clear
            </Button>
        </div>
    )
}
