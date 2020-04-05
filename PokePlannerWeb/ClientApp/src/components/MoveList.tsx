import React, { Component } from "react"

import { IHasCommon } from "./CommonMembers"
import { MoveEntry } from "../models/MoveEntry"

import "./TeamBuilder.scss"
import "../styles/types.scss"

interface IMoveListProps extends IHasCommon {
    /**
     * The ID of the Pokemon to show moves for.
     */
    pokemonId: number | undefined

    /**
     * Whether to show the moves.
     */
    showMoves: boolean
}

interface IMoveListState {
    /**
     * The moves to show.
     */
    moves: MoveEntry[]

    /**
     * Whether we're loading the moves.
     */
    loadingMoves: boolean
}

/**
 * Component for displaying a Pokemon's moves.
 */
export class MoveList extends Component<IMoveListProps, IMoveListState> {
    constructor(props: IMoveListProps) {
        super(props)
        this.state = {
            moves: [],
            loadingMoves: false
        }
    }

    componentDidMount() {
        this.fetchMoves()
    }

    componentDidUpdate(previousProps: IMoveListProps) {
        // refresh efficacy if the version group changed...
        let previousVersionGroupId = previousProps.versionGroupId
        let versionGroupId = this.props.versionGroupId
        let versionGroupChanged = versionGroupId !== previousVersionGroupId

        // ...or if the Pokemon ID changed
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanges = pokemonId !== previousPokemonId

        if (versionGroupChanged || pokemonChanges) {
            this.fetchMoves()
        }
    }

    render() {
        return this.renderMoves()
    }

    /**
     * Renders the moves.
     */
    renderMoves() {
        if (this.state.loadingMoves) {
            return (
                <div className="overflow-y">
                    Loading...
                </div>
            )
        }

        let moves = this.state.moves
        if (this.props.showMoves && moves.length > 0) {
            let rows = []
            for (let row = 0; row < moves.length; row++) {
                let move = moves[row]
                let moveName = move.getDisplayName("en") ?? "move"

                let typeId = move.type.id
                let headerId = `movelist${this.props.index}move${move.moveId}type${typeId}`
                let typeIcon = <img
                                id={headerId}
                                className="type-icon-small padded"
                                alt={`type${typeId}`}
                                src={require(`../images/typeIcons/${typeId}-small.png`)} />

                rows.push(
                    <div key={row}>
                        {moveName}
                        {typeIcon}
                    </div>
                )
            }

            return (
                <div className="overflow-y">
                    {rows}
                </div>
            )
        }

        return (
            <div className="overflow-y">
                -
            </div>
        )
    }

    /**
     * Retrieves the Pokemon's moves from PokemonController.
     */
    fetchMoves() {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(`Move list ${this.props.index}: version group ID is undefined!`)
        }

        let pokemonId = this.props.pokemonId
        if (pokemonId !== undefined) {
            console.log(`Move list ${this.props.index}: getting moves for Pokemon ${pokemonId}...`)

            // loading begins
            this.setState({ loadingMoves: true })

            // construct endpoint URL
            let endpointUrl = this.constructEndpointUrl(pokemonId, versionGroupId)

            // get moves
            fetch(endpointUrl)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Move list ${this.props.index}: tried to get moves for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then((moves: MoveEntry[]) => {
                    let concreteMoves = moves.map(MoveEntry.from)
                    this.setState({ moves: concreteMoves })
                })
                .catch(error => console.error(error))
                .then(() => this.setState({ loadingMoves: false }))
        }
    }

    /**
     * Returns the endpoint to use when fetching moves of the Pokemon with the given ID.
     */
    constructEndpointUrl(pokemonId: number, versionGroupId: number): string {
        return `${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/moves/${versionGroupId}`
    }
}