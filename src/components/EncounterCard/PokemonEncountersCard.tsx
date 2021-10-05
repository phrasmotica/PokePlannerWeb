import React, { useState } from "react"
import { Collapse } from "reactstrap"
import { Button, List } from "semantic-ui-react"

import { EncountersInfo } from "../../models/swagger"

interface PokemonEncountersCardProps {
    pokemonId: number
    encounters: EncountersInfo[]
}

export const PokemonEncountersCard = (props: PokemonEncountersCardProps) => {
    const [isOpen, setIsOpen] = useState(false)

    let toggleOpen = () => setIsOpen(!isOpen)

    // TODO: group encounters by version

    return (
        <List.Item>
            <List.Header>
                <Button onClick={toggleOpen}>
                    Pokemon {props.pokemonId}
                </Button>
            </List.Header>
            <List.Content>
                <Collapse isOpen={isOpen}>
                    {props.encounters.map(e => {
                        let versionText = `Version ${e.versionId}`

                        let levelsText = `level ${e.minLevel}`
                        if (e.minLevel !== e.maxLevel) {
                            levelsText = `levels ${e.minLevel} to ${e.maxLevel}`
                        }

                        let rarityText = `${e.encounterSlot!.rarity}% chance`
                        let conditions = e.conditions.map(c => c.encounterConditionValue?.name).join(", ")

                        return (
                            <div>
                                <p>{versionText}</p>
                                <p>{levelsText}, {rarityText}</p>
                                <p>{conditions}</p>
                            </div>
                        )
                    })}
                </Collapse>
            </List.Content>
        </List.Item>
    )
}
