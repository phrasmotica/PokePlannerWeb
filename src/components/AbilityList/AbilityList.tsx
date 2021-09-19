import React from "react"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { getDisplayNameOfAbility, getFlavourTextOfAbility } from "../../models/Helpers"
import { VarietyAbilityInfo } from "../../models/swagger"

import "./AbilityList.scss"

interface AbilityListProps extends IHasIndex {
    /**
     * The ID of the Pokemon to show abilities for.
     */
    abilities: VarietyAbilityInfo[]

    loading: boolean

    /**
     * Whether to show the abilities.
     */
    showAbilities: boolean
}

/**
 * Renders a Pokemon's abilities.
 */
export const AbilityList = (props: AbilityListProps) => {
    const renderAbilities = () => {
        let abilities = props.abilities

        if (props.abilities.length <= 0) {
            return (
                <div className="flex-center margin-bottom-small">
                    -
                </div>
            )
        }

        if (props.loading) {
            return (
                <div className="flex-center margin-bottom-small">
                    Loading...
                </div>
            )
        }

        let items = []
        if (props.showAbilities && abilities.length > 0) {
            for (let ability of abilities) {
                let abilityInfo = ability.ability!

                let abilityName = getDisplayNameOfAbility(abilityInfo)
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
                        {getFlavourTextOfAbility(abilityInfo) ?? "-"}
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

    return (
        <div className="abilityListContainer">
            <div className="abilityList" style={{ marginTop: 4 }}>
                {renderAbilities()}
            </div>
        </div>
    )
}
