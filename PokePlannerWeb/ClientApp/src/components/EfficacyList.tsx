import React, { Component } from "react"
import { Tooltip } from "reactstrap"
import { TypeSet } from "../models/TypeSet"

import "../styles/types.scss"
import "./EfficacyList.scss"
import { IHasCommon } from "./CommonMembers"

/**
 * The number of rows to split the types across.
 */
const NUMBER_OF_ROWS: number = 3

interface IEfficacyListProps extends IHasCommon {
    /**
     * The IDs of the types to show efficacy for.
     */
    typeIds: number[],

    /**
     * The type set.
     */
    typeSet: TypeSet,

    /**
     * Whether to show the multipliers.
     */
    showMultipliers: boolean
}

interface IEfficacyListState {
    /**
     * The efficacy set to show.
     */
    efficacy: any,

    /**
     * Whether we're loading the efficacy.
     */
    loadingEfficacy: boolean,

    /**
     * Whether the type tooltips are open.
     */
    typeTooltipOpen: boolean[]
}

/**
 * Component for displaying defensive type efficacy.
 */
export class EfficacyList extends Component<IEfficacyListProps, IEfficacyListState> {
    constructor(props: any) {
        super(props)
        this.state = {
            efficacy: null,
            loadingEfficacy: false,
            typeTooltipOpen: []
        }
    }

    componentDidMount() {
        // get efficacy
        this.getEfficacy()
    }

    componentDidUpdate(previousProps: IEfficacyListProps) {
        // refresh efficacy if the version group changed...
        let previousVersionGroupId = previousProps.versionGroupId
        let versionGroupId = this.props.versionGroupId
        let versionGroupChanged = versionGroupId !== previousVersionGroupId

        // ...or if the types changed
        let previousTypeIds = previousProps.typeIds
        let typeIds = this.props.typeIds
        let typesChanged = !this.arraysEqual(typeIds, previousTypeIds)

        if (versionGroupChanged || typesChanged) {
            this.getEfficacy()
        }

        // refresh tooltip states if the type set changed
        let previousTypeSet = previousProps.typeSet
        let typeSet = this.props.typeSet
        let typeSetChanged = typeSet !== previousTypeSet

        if (typeSetChanged) {
            this.setState({
                typeTooltipOpen: typeSet.typeIds.map(_ => false)
            })
        }
    }

    render() {
        return this.renderTypeEfficacy()
    }

    renderTypeEfficacy() {
        let rows = []
        let typeSet = this.props.typeSet
        let itemsPerRow = typeSet.typeIds.length / NUMBER_OF_ROWS

        let efficacy = this.state.efficacy
        for (let row = 0; row < NUMBER_OF_ROWS; row++) {
            let items = []
            for (let col = 0; col < itemsPerRow; col++) {
                // ensure each headers have unique IDs between all instances
                let index = row * itemsPerRow + col
                let headerId = `list${this.props.index}type${index}`

                let typeId = typeSet.typeIds[index]
                let typeHeader = <img
                                    id={headerId}
                                    className="type-icon-small padded"
                                    alt={`type${typeId}`}
                                    src={require(`../images/typeIcons/${typeId}-small.png`)} />

                if (efficacy === null) {
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
                    let typeIsPresent = typeSet.typesArePresent.filter((t: any) => t.id === typeId)[0].data
                    if (typeIsPresent) {
                        let matchingData = efficacy.efficacyMultipliers.filter((m: any) => m.id === typeId)

                        let multiplier = 1
                        if (matchingData.length > 0) {
                            multiplier = matchingData[0].data
                        }

                        let multiplierElement = this.getElementFromMultiplier(multiplier)
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
                        if (!this.props.hideTooltips) {
                            tooltip = (
                                <Tooltip
                                    isOpen={this.state.typeTooltipOpen[index]}
                                    toggle={() => this.toggleTypeTooltip(index)}
                                    placement="top"
                                    target={headerId}>
                                    {typeId} is absent from this game version
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

            rows.push(
                <div
                    key={row}
                    className="flex-space-between">
                    {items}
                </div>
            )
        }

        return (
            <div>
                {rows}
            </div>
        )
    }

    // returns the style class to use for the given multiplier
    getElementFromMultiplier(multiplier: number) {
        if (!this.hasTypes() || !this.props.showMultipliers) {
            return <span>-</span>
        }

        if (multiplier === 1) {
            return <span>1x</span>
        }

        let multiplierClass = this.getClassFromMultiplier(multiplier)
        return (
            <b className={multiplierClass}>
                {multiplier}x
            </b>
        )
    }

    // returns the style class to use for the given multiplier
    getClassFromMultiplier(multiplier: number) {
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
    toggleTypeTooltip(index: number) {
        let newTypeTooltipOpen = this.state.typeTooltipOpen.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        this.setState({
            typeTooltipOpen: newTypeTooltipOpen
        })
    }

    // returns true if we have types
    hasTypes() {
        return this.props.typeIds.length > 0
    }

    // retrieves the types' efficacy from EfficacyController
    getEfficacy() {
        if (this.hasTypes()) {
            let typeIds = this.props.typeIds
            let typesStr = typeIds.join("/")
            console.log(`Efficacy list ${this.props.index}: getting efficacy for ${typesStr}...`)

            // loading begins
            this.setState({ loadingEfficacy: true })

            // construct endpoint URL
            let endpointUrl = this.constructEndpointUrl(typeIds)

            // get efficacy data
            fetch(endpointUrl)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Efficacy list ${this.props.index}: tried to get efficacy for ${typesStr} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then(efficacy => this.setState({ efficacy: efficacy }))
                .catch(error => console.log(error))
                .then(() => this.setState({ loadingEfficacy: false }))
        }
    }

    // returns the endpoint to use when fetching efficacy of the given types
    constructEndpointUrl(typeIds: number[]): string {
        let endpointUrl = `${process.env.REACT_APP_API_URL}/efficacy?versionGroupId=${this.props.versionGroupId}`
        for (var i = 0; i < typeIds.length; i++) {
            endpointUrl += `&type${i + 1}=${typeIds[i]}`
        }

        return endpointUrl
    }

    // returns true if the two arrays are componentwise equal
    arraysEqual(arr1: any[], arr2: any[]) {
        if (arr1 === arr2) {
            return true
        }

        if (arr1 == null || arr2 == null) {
            return false
        }

        if (arr1.length !== arr2.length) {
            return false
        }

        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false
            }
        }

        return true
    }
}