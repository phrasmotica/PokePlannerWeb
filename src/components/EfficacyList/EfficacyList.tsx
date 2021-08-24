import React, { useEffect, useState } from "react"
import { Tooltip } from "reactstrap"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import {
    EfficacySet,
    TypeEntry,
    VersionGroupInfo
} from "../../models/swagger"

import "../../util/Extensions"

import "./EfficacyList.scss"
import "../../styles/types.scss"

interface EfficacyListProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * The IDs of the types to show efficacy for.
     */
    typeIds: number[]

    /**
     * The types.
     */
    types: TypeEntry[]

    /**
     * Whether to show the multipliers.
     */
    showMultipliers: boolean
}

/**
 * Renders defensive type efficacy.
 */
export const EfficacyList = (props: EfficacyListProps) => {
    const [efficacy, setEfficacy] = useState<EfficacySet>()
    const [loadingEfficacy, setLoadingEfficacy] = useState(false)
    const [typeTooltipOpen, setTypeTooltipOpen] = useState<boolean[]>([])

    const hasTypes = props.typeIds.length > 0

    useEffect(() => {
        const getEfficacy = () => {
            if (hasTypes) {
                let typeIds = props.typeIds
                let typesStr = typeIds.join("/")
                console.log(`Efficacy list ${props.index}: getting efficacy for ${typesStr}...`)

                // loading begins
                setLoadingEfficacy(true)

                // construct endpoint URL
                let endpointUrl = constructEndpointUrl(typeIds)

                // get efficacy data
                fetch(endpointUrl)
                    .then(response => {
                        if (response.status === 200) {
                            return response
                        }

                        throw new Error(`Efficacy list ${props.index}: tried to get efficacy for ${typesStr} but failed with status ${response.status}!`)
                    })
                    .then(response => response.json())
                    .then((efficacy: EfficacySet) => setEfficacy(efficacy))
                    .catch(error => console.error(error))
                    .then(() => setLoadingEfficacy(false))
            }
        }


        const constructEndpointUrl = (typeIds: number[]) => {
            let endpointUrl = `${process.env.REACT_APP_API_URL}/efficacy?versionGroup=${props.versionGroup?.versionGroupId}`
            for (var i = 0; i < typeIds.length; i++) {
                endpointUrl += `&type=${typeIds[i]}`
            }

            return endpointUrl
        }

        getEfficacy()
        setTypeTooltipOpen(props.types.map(_ => false))

        return () => setEfficacy(undefined)
    }, [props.index, props.versionGroup, props.types, props.typeIds, hasTypes])

    const renderTypeEfficacy = () => {
        let items = []
        let types = props.types

        for (let index = 0; index < types.length; index++) {
            // ensure each headers have unique IDs between all instances
            let headerId = `list${props.index}type${index}`

            let typeId = types[index].typeId
            let typeHeader = <img
                                id={headerId}
                                className="type-icon padded"
                                alt={`type${typeId}`}
                                src={require(`../../images/typeIcons/${typeId}.png`)} />

            if (!props.showMultipliers || efficacy === undefined) {
                items.push(
                    <div
                        key={index}
                        className="efficacy">
                        {typeHeader}
                        <br />
                        <span>-</span>
                    </div>
                )
            }
            else {
                let generationId = props.versionGroup?.generationId ?? 0
                let typeIsPresent = types[index].generation.generationId <= generationId
                if (typeIsPresent) {
                    let matchingData = efficacy.efficacyMultipliers.find(m => m.id === typeId)

                    let multiplier = 1
                    if (matchingData !== undefined) {
                        multiplier = matchingData.data
                    }

                    let multiplierElement = getElementFromMultiplier(multiplier)
                    items.push(
                        <div
                            key={index}
                            className="efficacy">
                            {typeHeader}
                            <br />
                            {multiplierElement}
                        </div>
                    )
                }
                else {
                    let tooltip = null
                    if (!props.hideTooltips) {
                        tooltip = (
                            <Tooltip
                                isOpen={typeTooltipOpen[index]}
                                toggle={() => toggleTypeTooltip(index)}
                                placement="top"
                                target={headerId}>
                                absent from this game version
                            </Tooltip>
                        )
                    }

                    items.push(
                        <div
                            key={index}
                            className="efficacy">
                            {typeHeader}
                            <br />
                            <b>N/A</b>
                            {tooltip}
                        </div>
                    )
                }
            }
        }

        return (
            <div className="fill-parent efficacyListContainer">
                {items}
            </div>
        )
    }

    // returns the style class to use for the given multiplier
    const getElementFromMultiplier = (multiplier: number) => {
        if (!hasTypes) {
            return <span>-</span>
        }

        if (multiplier === 1) {
            return <span>1x</span>
        }

        let multiplierClass = getClassFromMultiplier(multiplier)
        return (
            <b className={multiplierClass}>
                {multiplier}x
            </b>
        )
    }

    // returns the style class to use for the given multiplier
    const getClassFromMultiplier = (multiplier: number) => {
        let multiplierClass = "multiplier"

        if (multiplier <= 0) {
            multiplierClass += "-immune"
        }
        else if (multiplier < 1) {
            multiplierClass += "-notvery"

            if (multiplier < 0.5) {
                multiplierClass += "-extra"
            }
        }
        else if (multiplier > 1) {
            multiplierClass += "-super"

            if (multiplier > 2) {
                multiplierClass += "-extra"
            }
        }

        return multiplierClass
    }

    // toggle the type tooltip with the given index
    const toggleTypeTooltip = (index: number) => {
        let newTypeTooltipOpen = typeTooltipOpen.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        setTypeTooltipOpen(newTypeTooltipOpen)
    }

    return (
        <div style={{ marginTop: 4 }}>
            {renderTypeEfficacy()}
        </div>
    )
}
