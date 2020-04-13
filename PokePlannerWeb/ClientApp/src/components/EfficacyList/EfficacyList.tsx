import React, { Component } from "react"
import { Tooltip } from "reactstrap"

import { IHasCommon } from "../CommonMembers"
import { EfficacySet } from "../../models/EfficacyMap"
import { TypesPresenceMap } from "../../models/TypesPresenceMap"
import "../../util/Extensions"

import "../../styles/types.scss"
import "./EfficacyList.scss"

/**
 * The number of rows to split the types across.
 */
const NUMBER_OF_ROWS: number = 3

interface IEfficacyListProps extends IHasCommon {
    /**
     * The IDs of the types to show efficacy for.
     */
    typeIds: number[]

    /**
     * The types presence map.
     */
    typesPresenceMap: TypesPresenceMap

    /**
     * Whether to show the multipliers.
     */
    showMultipliers: boolean
}

interface IEfficacyListState {
    /**
     * The efficacy set to show.
     */
    efficacy: EfficacySet | undefined

    /**
     * Whether we're loading the efficacy.
     */
    loadingEfficacy: boolean

    /**
     * Whether the type tooltips are open.
     */
    typeTooltipOpen: boolean[]
}

/**
 * Component for displaying defensive type efficacy.
 */
export class EfficacyList extends Component<IEfficacyListProps, IEfficacyListState> {
    constructor(props: IEfficacyListProps) {
        super(props)
        this.state = {
            efficacy: undefined,
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
        let typesChanged = !typeIds.equals(previousTypeIds)

        if (versionGroupChanged || typesChanged) {
            this.getEfficacy()

            // hide types presence tooltips
            let typesPresenceMap = this.props.typesPresenceMap.presenceMap
            this.setState({
                typeTooltipOpen: typesPresenceMap.map(_ => false)
            })
        }
    }

    render() {
        return (
            <div style={{ marginTop: 4 }}>
                {this.renderTypeEfficacy()}
            </div>
        )
    }

    renderTypeEfficacy() {
        let rows = []
        let presenceMap = this.props.typesPresenceMap.presenceMap
        let itemsPerRow = presenceMap.length / NUMBER_OF_ROWS

        let efficacy = this.state.efficacy
        for (let row = 0; row < NUMBER_OF_ROWS; row++) {
            let items = []
            for (let col = 0; col < itemsPerRow; col++) {
                // ensure each headers have unique IDs between all instances
                let index = row * itemsPerRow + col
                let headerId = `list${this.props.index}type${index}`

                let typeId = presenceMap[index].id
                let typeHeader = <img
                                    id={headerId}
                                    className="type-icon-small padded"
                                    alt={`type${typeId}`}
                                    src={require(`../../images/typeIcons/${typeId}-small.png`)} />

                if (!this.props.showMultipliers || efficacy === undefined) {
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
                    let typeIsPresent = presenceMap[index].data
                    if (typeIsPresent) {
                        let matchingData = efficacy.efficacyMultipliers.find(m => m.id === typeId)

                        let multiplier = 1
                        if (matchingData !== undefined) {
                            multiplier = matchingData.data
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
        if (!this.hasTypes()) {
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
                .catch(error => console.error(error))
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
}