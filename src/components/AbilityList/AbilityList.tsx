import React, { useEffect, useState } from "react"
import key from "weak-key"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { getDisplayName, getFlavourText } from "../../models/Helpers"
import { PokemonAbilityContext } from "../../models/swagger"

import "./AbilityList.scss"

interface AbilityListProps extends IHasIndex, IHasVersionGroup {
    /**
     * The ID of the Pokemon to show abilities for.
     */
    pokemonId: number | undefined

    /**
     * Whether to show the abilities.
     */
    showAbilities: boolean
}

/**
 * Renders a Pokemon's abilities.
 */
export const AbilityList = (props: AbilityListProps) => {
    const [abilities, setAbilities] = useState<PokemonAbilityContext[]>([])
    const [loadingAbilities, setLoadingAbilities] = useState(false)

    const renderAbilities = () => {
        if (props.pokemonId === undefined) {
            return (
                <div className="flex-center margin-bottom-small">
                    -
                </div>
            )
        }

        if (loadingAbilities) {
            return (
                <div className="flex-center margin-bottom-small">
                    Loading...
                </div>
            )
        }

        let items = []
        if (props.showAbilities && abilities.length > 0) {
            for (let ability of abilities) {
                let abilityName = getDisplayName(ability, "en") ?? "ability"
                let hiddenText = ability.isHidden ? " (hidden)" : ""

                let nameElement = (
                    <div className="abilityName">
                        <b>
                            {abilityName}
                        </b>
                        {hiddenText}
                    </div>
                )

                let flavourTextElement = (
                    <div className="abilityFlavourText">
                        {getFlavourText(ability, props.versionGroupId!, "en")}
                    </div>
                )

                items.push(
                    <div
                        key={key(ability)}
                        className="abilityItem">
                        {nameElement}
                        {flavourTextElement}
                    </div>
                )
            }
        }

        return (
            <div className="flex margin-bottom-small">
                {items}
            </div>
        )
    }

    // refresh abilities if the Pokemon ID changed
    useEffect(() => {
        const fetchAbilities = () => {
            let pokemonId = props.pokemonId
            if (pokemonId !== undefined) {
                console.log(`Ability list ${props.index}: getting abilities for Pokemon ${pokemonId}...`)
                setLoadingAbilities(true)

                fetch(`${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/abilities`)
                    .then(response => {
                        if (response.status === 200) {
                            return response
                        }

                        throw new Error(`Ability list ${props.index}: tried to get abilities for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                    })
                    .then(response => response.json())
                    .then((abilities: PokemonAbilityContext[]) => setAbilities(abilities))
                    .catch(error => console.error(error))
                    .then(() => setLoadingAbilities(false))
            }
        }

        fetchAbilities()

        return () => setAbilities([])
    }, [props.index, props.pokemonId])

    return (
        <div className="abilityListContainer">
            <div className="abilityList" style={{ marginTop: 4 }}>
                {renderAbilities()}
            </div>
        </div>
    )
}
