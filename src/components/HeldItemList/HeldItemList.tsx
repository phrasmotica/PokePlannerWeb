import React from "react"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { getDisplayName } from "../../models/Helpers"

import {
    PokemonEntry,
    VersionGroupEntry
} from "../../models/swagger"

import "./HeldItemList.scss"

interface HeldItemListProps extends IHasIndex {
    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * The Pokemon to show held items for.
     */
    pokemon: PokemonEntry | undefined

    /**
     * Whether to show the held items.
     */
    showHeldItems: boolean
}

/**
 * Renders a Pokemon's held items.
 */
export const HeldItemList = (props: HeldItemListProps) => {
    const renderHeldItems = () => {
        let versionGroup = props.versionGroup
        if (versionGroup === undefined) {
            return (
                <div className="flex-center margin-bottom-small">
                    -
                </div>
            )
        }

        let versions = versionGroup.versions
        let versionIds = versions.map(v => v.versionId)
        let heldItems = props.pokemon?.heldItems.filter(e => versionIds.includes(e.id)) ?? []

        let versionElements = []
        for (let version of versions) {
            let versionName = getDisplayName(version, "en") ?? "version"
            let versionNameElement = (
                <div className="versionName">
                    <b>
                        {versionName}
                    </b>
                </div>
            )

            let listElements = []

            let entry = heldItems.find(e => e.id === version.versionId)!
            if (entry !== undefined) {
                // display items in descending order of rarity
                let itemList = entry.data.sort((i1, i2) => i2.rarity - i1.rarity)
                for (let item of itemList) {
                    let itemName = getDisplayName(item, "en") ?? "item"
                    let itemRarity = `(${item.rarity}%)`

                    listElements.push(
                        <div
                            key={key(item)}
                            className="itemDescription">
                            {itemName} {itemRarity}
                        </div>
                    )
                }
            }
            else {
                listElements.push(
                    <div key={0} className="itemDescription">
                        -
                    </div>
                )
            }

            versionElements.push(
                <div
                    key={key(version)}
                    className="versionItem">
                    {versionNameElement}
                    {listElements}
                </div>
            )
        }

        return (
            <div className="flex margin-bottom-small">
                {versionElements}
            </div>
        )
    }

    return (
        <div className="heldItemListContainer">
            <div className="heldItemList" style={{ marginTop: 4 }}>
                {renderHeldItems()}
            </div>
        </div>
    )
}
