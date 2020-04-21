import React, { Component } from "react"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { PokemonEntry } from "../../models/PokemonEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"

import "./HeldItemList.scss"

interface IHeldItemListProps extends IHasIndex {
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

interface IHeldItemListState {

}

/**
 * Component for displaying a Pokemon's abilities.
 */
export class HeldItemList extends Component<IHeldItemListProps, IHeldItemListState> {
    constructor(props: IHeldItemListProps) {
        super(props)
        this.state = {
            abilities: [],
            loadingAbilities: false
        }
    }

    render() {
        return (
            <div className="heldItemListContainer">
                <div className="heldItemList" style={{ marginTop: 4 }}>
                    {this.renderHeldItems()}
                </div>
            </div>
        )
    }

    /**
     * Renders the Pokemon's held items.
     */
    renderHeldItems() {
        let versionGroup = this.props.versionGroup
        let pokemon = this.props.pokemon
        if (versionGroup === undefined || pokemon === undefined) {
            return (
                <div className="flex-center margin-bottom-small">
                    -
                </div>
            )
        }

        let versions = versionGroup.versions
        let versionIds = versions.map(v => v.versionId)
        let heldItems = pokemon.heldItems.filter(e => versionIds.includes(e.id))
        if (heldItems.length <= 0) {
            return (
                <div className="flex-center margin-bottom-small">
                    No held items in this game version
                </div>
            )
        }

        let versionElements = []
        for (let version of versions) {
            let versionName = version.getDisplayName("en") ?? "version"
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
                    let itemName = item.getDisplayName("en") ?? "item"
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
                    <div className="itemDescription">
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
}