import React, { Component } from "react"
import { Spinner, Tooltip } from "reactstrap"
import { TypeSet } from "../models/TypeSet"

import "../styles/types.scss"
import "./EfficacyList.scss"

/**
 * The number of rows to split the types across.
 */
const NUMBER_OF_ROWS: number = 2

type EfficacyListProps = {
    /**
     * The index of this efficacy list.
     */
    index: number,

    /**
     * The Pokemon to show efficacy for.
     */
    species: string,

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number,

    /**
     * The type set.
     */
    typeSet: TypeSet,

    /**
     * Whether the parent component is loading.
     */
    parentIsLoading: boolean,

    /**
     * Whether to show the multipliers.
     */
    showMultipliers: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

type EfficacyListState = {
    /**
     * The efficacy to show.
     */
    efficacy: number[],

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
export class EfficacyList extends Component<EfficacyListProps, EfficacyListState> {
    constructor(props: any) {
        super(props)
        this.state = {
            efficacy: [],
            loadingEfficacy: false,
            typeTooltipOpen: []
        }
    }

    componentDidMount() {
        // get efficacy
        this.getEfficacy()
    }

    componentDidUpdate(previousProps: EfficacyListProps) {
        // refresh efficacy if the version group changed...
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        // ...or if the species changed
        let previousSpecies = previousProps.species
        let species = this.props.species
        let speciesChanged = species !== previousSpecies

        if (versionGroupChanged || speciesChanged) {
            this.getEfficacy()
        }

        // refresh tooltip states if the type set changed
        let previousTypeSet = previousProps.typeSet
        let typeSet = this.props.typeSet
        let typeSetChanged = typeSet !== previousTypeSet

        if (typeSetChanged) {
            this.setState({
                typeTooltipOpen: typeSet.types.map(_ => false)
            })
        }
    }

    render() {
        return this.renderTypeEfficacy()
    }

    renderTypeEfficacy() {
        let rows = []
        let typeSet = this.props.typeSet
        let itemsPerRow = typeSet.types.length / NUMBER_OF_ROWS

        let efficacy = this.state.efficacy
        for (let row = 0; row < NUMBER_OF_ROWS; row++) {
            let items = []
            for (let col = 0; col < itemsPerRow; col++) {
                // ensure each headers have unique IDs between all instances
                let index = row * itemsPerRow + col
                let headerId = `list${this.props.index}type${index}`

                let type = typeSet.types[index]
                let typeHeader = <img
                                    id={headerId}
                                    className="type-icon padded"
                                    src={require(`../images/typeIcons/${type.toLowerCase()}.png`)} />

                if (typeSet.typesArePresent[index]) {
                    let multiplierElement = this.getElementFromMultiplier(efficacy[index])
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
                                {type} is absent from this game version
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

            rows.push(
                <div
                    key={row}
                    className="flex margin-bottom">
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
        let multiplierClass = this.getClassFromMultiplier(multiplier)

        if (!this.hasSpecies() || !this.props.showMultipliers) {
            return <b>-</b>
        }

        if (this.props.parentIsLoading || this.state.loadingEfficacy) {
            return this.makeSpinner()
        }

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

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" size="sm" />
    }

    // toggle the type tooltip with the given index
    toggleTypeTooltip(index: number) {
        let newTypeTooltipOpen = this.state.typeTooltipOpen.map((item, j) => {
            if (j == index) {
                return !item
            }

            return item
        })

        this.setState({
            typeTooltipOpen: newTypeTooltipOpen
        })
    }

    // returns true if we have a species
    hasSpecies() {
        return this.props.species && this.props.species !== ""
    }

    // retrieves the Pokemon's efficacy from EfficacyController
    getEfficacy() {
        if (this.hasSpecies()) {
            let species = this.props.species
            console.log(`Efficacy list ${this.props.index}: getting efficacy for '${species}'...`)

            // loading begins
            this.setState({ loadingEfficacy: true })

            // get efficacy data
            fetch(`efficacy/${species}/${this.props.versionGroupIndex}`)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Efficacy list ${this.props.index}: tried to get efficacy for ${species}' but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then(efficacy => this.setState({ efficacy: efficacy }))
                .catch(error => console.log(error))
                .then(() => this.setState({ loadingEfficacy: false }))
        }
    }
}