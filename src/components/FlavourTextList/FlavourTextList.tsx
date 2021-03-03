import React from "react"
import key from "weak-key"

import { IHasIndex } from "../CommonMembers"

import { getDisplayName, getFlavourText } from "../../models/Helpers"

import {
    PokemonSpeciesEntry,
    VersionEntry
} from "../../models/swagger"

import "./FlavourTextList.scss"

interface FlavourTextListProps extends IHasIndex {
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

/**
 * Renders a species' flavour text entries.
 */
export const FlavourTextList = (props: FlavourTextListProps) => {
    const renderFlavourText = () => {
        let species = props.species
        let versions = props.versions.sort((v1, v2) => v1.versionId - v2.versionId)

        let items = []
        if (versions.length > 0) {
            for (let v of versions) {
                let versionNameElement = (
                    <div className="flavourTextVersionName">
                        <b>
                            {getDisplayName(v, "en") ?? v.name}
                        </b>
                    </div>
                )

                let flavourText = "-"
                if (props.showFlavourText && species !== undefined) {
                    flavourText = getFlavourText(species, v.versionId, "en") ?? "?"
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

    return (
        <div className="flavourTextContainer">
            {renderFlavourText()}
        </div>
    )
}
