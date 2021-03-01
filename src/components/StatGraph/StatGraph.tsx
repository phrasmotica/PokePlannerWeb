import React from "react"

import { IHasIndex } from "../CommonMembers"

import "./StatGraph.scss"

interface StatGraphProps extends IHasIndex {
    /**
     * The stat names.
     */
    statNames: string[]

    /**
     * The stat values.
     */
    statValues: number[]

    /**
     * Whether to show the stat graph.
     */
    shouldShowStats: boolean
}

/**
 * Renders a set of stats as a graph.
 */
export const StatGraph = (props: StatGraphProps) => {
    const statNames = (
        <div className="stat-names">
            {props.statNames.map((name, i) => {
                return (
                    <div key={i}>
                        {name}
                    </div>
                )
            })}
        </div>
    )

    const statBars = (
        <div>
            {props.statNames.map((name, i) => {
                let values = props.statValues
                let value = 0
                if (props.shouldShowStats && values.length > i) {
                    value = values[i]
                }

                let shortName = name.replace(" ", "-").toLowerCase()
                return (
                    <div key={i} className="flex">
                        <div
                            className={"stat-bar " + shortName}
                            style={{ width: value }} />

                        <div className="stat-value">
                            {value > 0 ? value : "-"}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    return (
        <div style={{ margin: 4 }}>
            <div className="stat-graph">
                {statNames}
                {statBars}
            </div>
        </div>
    )
}
