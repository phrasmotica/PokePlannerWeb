import React from "react"
import { List } from "semantic-ui-react"

import { getDisplayNameOfEncounterMethod, sortEncounters } from "../../models/Helpers"
import { EncounterMethod, EncountersInfo } from "../../models/swagger"

interface EncounterCardProps {
    method: EncounterMethod
    encounters: EncountersInfo[]
}

export const EncounterCard = (props: EncounterCardProps) => {
    let sortedEncounters = sortEncounters(props.encounters)

    return (
        <List.Item>
            <List.Header>
                {getDisplayNameOfEncounterMethod(props.method)}
            </List.Header>
            <List.Content>
                {sortedEncounters.map(e => {
                    let pokemonText = `Pokemon ${e.pokemonId}`
                    let versionText = `Version ${e.versionId}`

                    let levelsText = `level ${e.minLevel}`
                    if (e.minLevel !== e.maxLevel) {
                        levelsText = `levels ${e.minLevel} to ${e.maxLevel}`
                    }

                    let rarityText = `${e.encounterSlot!.rarity}% chance`
                    let conditions = e.conditions.map(c => c.encounterConditionValue?.name).join(", ")

                    return (
                        <div>
                            <p>{pokemonText}</p>
                            <p>{versionText}</p>
                            <p>{levelsText}, {rarityText}</p>
                            <p>{conditions}</p>
                        </div>
                    )
                })}
            </List.Content>
        </List.Item>
    )
}
