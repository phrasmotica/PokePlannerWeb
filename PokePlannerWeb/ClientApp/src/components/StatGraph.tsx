import React, { Component } from "react"

import "./StatGraph.scss"
import { IIndexProp } from "./CommonProps"

interface IStatGraphProps extends IIndexProp {
    /**
     * The stat names.
     */
    statNames: string[],

    /**
     * The stat values.
     */
    statValues: number[],

    /**
     * Whether to show the stat graph.
     */
    shouldShowStats: boolean
}

/**
 * Component for showing a set of stats as a graph.
 */
export class StatGraph extends Component<IStatGraphProps, any> {
    constructor(props: any) {
        super(props)
    }

    render() {
        return this.renderStatGraph()
    }

    renderStatGraph() {
        return (
            <div
                className="flex-center"
                style={{ marginTop: 4 }}>
                <div className="stat-graph">
                    {this.renderStatNames()}

                    {this.renderStatBars()}
                </div>
            </div>
        )
    }

    renderStatNames() {
        return (
            <div className="stat-names">
                {this.props.statNames.map((name, i) => {
                    return (
                        <div key={i}>
                            {name}
                        </div>
                    )
                })}
            </div>
        )
    }

    renderStatBars() {
        let shouldShowStats = this.props.shouldShowStats
        return (
            <div className="stat-bars">
                {this.props.statNames.map((_, i) => {
                    let values = this.props.statValues
                    let value = 0
                    if (shouldShowStats && values.length > i) {
                        value = values[i]
                    }

                    return (
                        <div className="flex">
                            <div
                                key={i}
                                className="stat-bar"
                                style={{ width: value }} />

                            <div className="stat-value">
                                {value > 0 ? value : "-"}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}