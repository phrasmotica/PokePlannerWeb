import React, { Component } from "react"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { VersionEntry } from "../../models/VersionEntry"

import "./FlavourTextList.scss"

interface IFlavourTextListProps extends IHasIndex {
    /**
     * The species to show flavour text for.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * The versions to show flavour text for.
     */
    versions: VersionEntry[]

    /**
     * Whether to show the flavour text.
     */
    showFlavourText: boolean
}

interface IFlavourTextListState {

}

/**
 * Component for displaying a species' flavour text entries.
 */
export class FlavourTextList extends Component<IFlavourTextListProps, IFlavourTextListState> {
    /**
     * Renders the component.
     */
    render() {
        return (
            <div className="flavourTextContainer">
                {this.renderFlavourText()}
            </div>
        )
    }

    /**
     * Renders the flavour text entries.
     */
    renderFlavourText() {
        let species = this.props.species
        let versions = this.props.versions.sort((v1, v2) => v1.versionId - v2.versionId)

        let items = []
        if (versions.length > 0) {
            for (let v of versions) {
                let versionNameElement = (
                    <div className="flavourTextVersionName">
                        <b>
                            {v.getDisplayName("en") ?? "-"}
                        </b>
                    </div>
                )

                let flavourText = "-"
                if (this.props.showFlavourText && species !== undefined) {
                    flavourText = species.getFlavourText(v.versionId, "en") ?? "?"
                }

                let flavourTextElement = (
                    <div className="flavourText">
                        {flavourText}
                    </div>
                )

                items.push(
                    <div
                        key={key(v)}
                        className="flavourTextItem">
                        {versionNameElement}
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
}