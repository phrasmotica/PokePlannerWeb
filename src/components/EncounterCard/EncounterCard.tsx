import React from "react"
import { List } from "semantic-ui-react"
import { getDisplayNameOfEncounterMethod, sortEncounters } from "../../models/Helpers"

import { EncountersInfo } from "../../models/swagger"

interface EncounterCardProps {
    pokemonId: number
    encounters: EncountersInfo[]
}

export const EncounterCard = (props: EncounterCardProps) => {
    let sortedEncounters = sortEncounters(props.encounters)

    return (
        <List.Item>
            <List.Header>
                Pokemon {props.pokemonId}
            </List.Header>
            <List.Content>
                {sortedEncounters.map(e => {
                    let levelsText = `level ${e.minLevel}`
                    if (e.minLevel !== e.maxLevel) {
                        levelsText = `levels ${e.minLevel} to ${e.maxLevel}`
                    }

                    let rarityText = `${e.encounterSlot!.rarity}% chance`
                    let methodText = getDisplayNameOfEncounterMethod(e.encounterSlot!.method!)
                    let conditions = e.conditions.map(c => c.encounterConditionValue?.name).join(", ")

                    return (
                        <div>
                            <p>{levelsText}, {rarityText}, {methodText}</p>
                            <p>{conditions}</p>
                        </div>
                    )
                })}
            </List.Content>
        </List.Item>
    )
}
