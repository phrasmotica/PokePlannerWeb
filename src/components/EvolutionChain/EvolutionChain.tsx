﻿import React, { useEffect, useState } from "react"

import { EvolutionTree } from "./EvolutionTree"

import { IHasIndex } from "../CommonMembers"

import {
    EvolutionChainEntry,
    PokemonSpeciesInfo
} from "../../models/swagger"

import "./EvolutionChain.scss"

interface EvolutionChainProps extends IHasIndex {
    /**
     * The species this chain is being shown for.
     */
    species: PokemonSpeciesInfo | undefined

    /**
     * The IDs of the species available in the parent selector.
     */
    availableSpeciesIds: number[]

    /**
     * Whether to show the species' shiny sprites.
     */
    showShinySprites: boolean

    /**
     * Whether to show the evolution chain.
     */
    shouldShowChain: boolean

    /**
     * Handler for setting the Pokemon species in the parent component.
     */
    setSpecies: (species: PokemonSpeciesInfo | undefined) => void
}

/**
 * Renders a species' evolution chain.
 */
export const EvolutionChain = (props: EvolutionChainProps) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionChainEntry>()
    const [loadingChain, setLoadingChain] = useState(false)

    useEffect(() => {
        const fetchEvolutionChain = () => {
            let species = props.species
            if (species !== undefined) {
                let speciesId = species.pokemonSpeciesId

                console.log(`Evolution chain ${props.index}: getting evolution chain for species ${speciesId}...`)
                setLoadingChain(true)

                // get evolution chain
                fetch(`${process.env.REACT_APP_API_URL}/evolutionChain/${speciesId}`)
                    .then(response => {
                        if (response.status === 200) {
                            return response
                        }

                        throw new Error(`Evolution chain ${props.index}: tried to get evolution chain for species ${speciesId} but failed with status ${response.status}!`)
                    })
                    .then(response => response.json())
                    .then((chain: EvolutionChainEntry) => setEvolutionChain(chain))
                    .catch(error => {
                        console.error(error)
                        setEvolutionChain(undefined)
                    })
                    .finally(() => setLoadingChain(false))
            }
            else {
                setEvolutionChain(undefined)
            }
        }

        // TODO: implement logic for deciding whether we fetch the evolution chain
        fetchEvolutionChain()

        return () => setEvolutionChain(undefined)
    }, [props.index, props.species])

    /**
     * Renders the evolution chain.
     */
    const renderEvolutionChain = () => {
        if (!props.shouldShowChain) {
            return (
                <div className="flex-center evolution-chain">
                    -
                </div>
            )
        }

        if (loadingChain) {
            return (
                <div className="flex-center evolution-chain">
                    Loading...
                </div>
            )
        }

        let chain = evolutionChain?.chain
        if (chain === undefined) {
            return (
                <div className="flex-center evolution-chain">
                    this Pokemon does not evolve
                </div>
            )
        }

        return (
            <EvolutionTree
                chain={chain}
                index={props.index}
                species={props.species}
                availableSpeciesIds={props.availableSpeciesIds}
                showShinySprites={props.showShinySprites}
                setSpecies={props.setSpecies} />
        )
    }

    return renderEvolutionChain()
}
