import React, { Component } from "react"
import { ListGroup, ListGroupItem, Button, Collapse, FormGroup, Input, Label } from "reactstrap"
import { TiStarburstOutline, TiSpiral, TiWaves } from "react-icons/ti"
import key from "weak-key"

import { IHasCommon } from "./CommonMembers"
import { MoveEntry } from "../models/MoveEntry"

import "./MoveList.scss"
import "./TeamBuilder.scss"
import "../styles/types.scss"

interface IMoveListProps extends IHasCommon {
    /**
     * The ID of the Pokemon to show moves for.
     */
    pokemonId: number | undefined

    /**
     * The IDs of types of the Pokemon to show moves for.
     */
    typeIds: number[]

    /**
     * Whether to show the moves.
     */
    showMoves: boolean
}

interface IMoveListState {
    /**
     * Whether to only show moves with STAB.
     */
    stabOnly: boolean

    /**
     * The moves to show.
     */
    moves: MoveEntry[]

    /**
     * Whether we're loading the moves.
     */
    loadingMoves: boolean

    /**
     * Whether each move's info pane is open.
     */
    movesAreOpen: boolean[]
}

/**
 * Component for displaying a Pokemon's moves.
 */
export class MoveList extends Component<IMoveListProps, IMoveListState> {
    constructor(props: IMoveListProps) {
        super(props)
        this.state = {
            stabOnly: false,
            moves: [],
            loadingMoves: false,
            movesAreOpen: []
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
        // TODO: add filter by type/STAB/(non-)damaging/power/etc
        return (
            <div>
                <div style={{ marginTop: 4 }}>
                    {this.renderFilters()}
                </div>

                <div style={{ marginTop: 4 }}>
                    {this.renderMoves()}
                </div>
            </div>
        )
    }

    /**
     * Renders the filters.
     */
    renderFilters() {
        let stabId = "stabCheckbox" + this.props.index

        return (
            <div className="flex">
                <FormGroup check>
                    <Input
                        type="checkbox"
                        id={stabId}
                        checked={this.state.stabOnly}
                        onChange={() => this.toggleStabOnly()} />

                    <Label for={stabId} check>
                        <span title="Only show moves with STAB (same-type attack bonus)">
                            STAB only
                        </span>
                    </Label>
                </FormGroup>
            </div>
        )
    }


    /**
     * Toggles the STAB only filter.
     */
    toggleStabOnly() {
        this.setState(previousState => ({
            stabOnly: !previousState.stabOnly
        }))
    }

    /**
     * Renders the moves.
     */
    renderMoves() {
        if (this.state.loadingMoves) {
            return (
                <ListGroup className="overflow-y">
                    <ListGroupItem>
                        Loading...
                    </ListGroupItem>
                </ListGroup>
            )
        }

        let moves = this.getMovesToShow()
        if (this.props.showMoves && moves.length > 0) {
            let rows = []
            for (let row = 0; row < moves.length; row++) {
                let move = moves[row]
                let moveName = move.getDisplayName("en") ?? "move"

                let moveNameElement = <span>{moveName}</span>

                let isStab = this.isStab(move)
                if (isStab) {
                    moveNameElement = <span><b>{moveName}</b></span>
                }

                const openInfoPane = () => this.toggleMoveOpen(row)
                let moveNameButton = (
                    <Button
                        color="link"
                        onMouseUp={openInfoPane}>
                        {moveNameElement}
                    </Button>
                )

                let typeId = move.type.id
                let headerId = `movelist${this.props.index}move${move.moveId}type${typeId}`
                let typeIcon = <img
                                id={headerId}
                                className="type-icon padded"
                                alt={`type${typeId}`}
                                src={require(`../images/typeIcons/${typeId}-small.png`)} />

                let damageClassIcon = this.getDamageClassIcon(move.damageClass.id)

                let isOpen = this.state.movesAreOpen[row]
                let powerElement = <div>Power: {move.power ?? "-"}</div>
                if (isStab) {
                    // exclamation mark indicates the value is non-null
                    let stabElement = (
                        <span title="same-type attack bonus">
                            <b>{move.power! * 1.5}</b>
                        </span>
                    )

                    powerElement = (
                        <div>
                            Power: {move.power!} ({stabElement})
                        </div>
                    )
                }

                let infoPane = (
                    <Collapse isOpen={isOpen}>
                        <div style={{ display: "flex" }}>
                            <div className="text-align-right margin-right-small">
                                {powerElement}
                                <div>Accuracy: {move.accuracy ?? "-"}</div>
                                <div>PP: {move.pp ?? "-"}</div>
                            </div>

                            <div className="text-align-center margin-right-small">
                                <div>{typeIcon}</div>

                                <div>{damageClassIcon}</div>
                            </div>
                        </div>
                    </Collapse>
                )

                rows.push(
                    <ListGroupItem key={key(move)}>
                        {moveNameButton}
                        {infoPane}
                    </ListGroupItem>
                )
            }

            return (
                <ListGroup className="overflow-y">
                    {rows}
                </ListGroup>
            )
        }

        return (
            <ListGroup className="overflow-y">
                <ListGroupItem>
                    -
                </ListGroupItem>
            </ListGroup>
        )
    }

    /**
     * Returns the moves to display.
     */
    getMovesToShow() {
        let moves = this.state.moves

        if (this.state.stabOnly) {
            moves = moves.filter(m => this.isStab(m))
        }

        return moves
    }

    /**
     * Returns whether the given move has STAB.
     */
    isStab(move: MoveEntry) {
        return move.isDamaging() && this.props.typeIds.includes(move.type.id)
    }

    /**
     * Toggles the move info pane with the given index.
     */
    toggleMoveOpen(index: number) {
        let newMovesAreOpen = this.state.movesAreOpen.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        this.setState({ movesAreOpen: newMovesAreOpen })
    }

    /**
     * Returns an icon for the damage class with the given ID.
     */
    getDamageClassIcon(damageClassId: number) {
        switch (damageClassId) {
            case 1:
                // status
                return <TiWaves className="damage-class-small" />
            case 2:
                // physical
                return <TiStarburstOutline className="damage-class-small" />
            case 3:
                // special
                return <TiSpiral className="damage-class-small" />
            default:
                throw new Error(
                    `Move list ${this.props.index}: no move damage class with ID ${damageClassId} exists!`
                )
        }
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
                    this.setState({
                        moves: concreteMoves,
                        movesAreOpen: concreteMoves.map(_ => false)
                    })
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