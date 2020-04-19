import React, { Component } from "react"
import { Tooltip } from "reactstrap"

import { IHasCommon } from "../CommonMembers"
import { EfficacySet } from "../../models/EfficacyMap"
import { VersionGroupTypeContext } from "../../models/TypeEntry"

import "../../util/Extensions"

import "./EfficacyList.scss"
import "../../styles/types.scss"

interface IEfficacyListProps extends IHasCommon {
    /**
     * The IDs of the types to show efficacy for.
     */
    typeIds: number[]

    /**
     * The types.
     */
    types: VersionGroupTypeContext[]

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
            let types = this.props.types
            this.setState({
                typeTooltipOpen: types.map(_ => false)
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
        let items = []
        let types = this.props.types

        let efficacy = this.state.efficacy
        for (let index = 0; index < types.length; index++) {
            // ensure each headers have unique IDs between all instances
            let headerId = `list${this.props.index}type${index}`

            let typeId = types[index].typeId
            let typeHeader = <img
                                id={headerId}
                                className="type-icon padded"
                                alt={`type${typeId}`}
                                src={require(`../../images/typeIcons/${typeId}.png`)} />

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
                let typeIsPresent = types[index].isPresent
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

        return (
            <div className="fill-parent efficacyListContainer">
                {items}
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