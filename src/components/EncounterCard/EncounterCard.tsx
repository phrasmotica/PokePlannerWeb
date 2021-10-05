import React, { useState } from "react"
import { Collapse } from "reactstrap"
import { Button, List } from "semantic-ui-react"

import { getDisplayNameOfEncounterMethod, groupBy, sortEncounters } from "../../models/Helpers"
import { EncounterMethod, EncountersInfo } from "../../models/swagger"
import { PokemonEncountersCard } from "./PokemonEncountersCard"

interface EncounterCardProps {
    method: EncounterMethod
    encounters: EncountersInfo[]
}

export const EncounterCard = (props: EncounterCardProps) => {
    const [isOpen, setIsOpen] = useState(false)

    let sortedEncounters = sortEncounters(props.encounters)

    let uniquePokemonIds = [...new Set(sortedEncounters.map(e => e.pokemonId))]

    let groupedEncounters = groupBy(sortedEncounters, x => x.pokemonId)

    let toggleOpen = () => setIsOpen(!isOpen)

    return (
        <List.Item>
            <List.Header>
                <Button onClick={toggleOpen}>
                    {getDisplayNameOfEncounterMethod(props.method)} ({uniquePokemonIds.length})
                </Button>
            </List.Header>
            <List.Content>
                <Collapse isOpen={isOpen}>
                    <List divided>
                        {uniquePokemonIds.map(id => (
                            <PokemonEncountersCard
                                pokemonId={id}
                                encounters={groupedEncounters[id]} />
                        ))}
                    </List>
                </Collapse>
            </List.Content>
        </List.Item>
    )
}
