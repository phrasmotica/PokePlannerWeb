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
     * Whether to only show moves with that deal damage.
     */
    damagingOnly: boolean

    /**
     * Whether to only show moves with that don't deal damage.
     */
    nonDamagingOnly: boolean

    /**
     * Whether to only show moves with one of the current Pokemon's types.
     */
    sameTypeOnly: boolean

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
            damagingOnly: false,
            nonDamagingOnly: false,
            sameTypeOnly: false,
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
        // TODO: add filter by type/(non-)damaging/power/etc
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
        let damagingId = "damagingCheckbox" + this.props.index
        let nonDamagingId = "nonDamagingCheckbox" + this.props.index
        let sameTypeId = "sameTypeCheckbox" + this.props.index

        return (
            <div className="flex">
                <FormGroup
                    check
                    className="margin-right-small">
                    <Input
                        type="checkbox"
                        id={damagingId}
                        checked={this.state.damagingOnly}
                        onChange={() => this.toggleDamagingOnly()} />

                    <Label for={damagingId} check>
                        <span title="Only show moves that deal damage">
                            damaging only
                        </span>
                    </Label>
                </FormGroup>

                <FormGroup
                    check
                    className="margin-right-small">
                    <Input
                        type="checkbox"
                        id={nonDamagingId}
                        checked={this.state.nonDamagingOnly}
                        onChange={() => this.toggleNonDamagingOnly()} />

                    <Label for={nonDamagingId} check>
                        <span title="Only show moves that don't deal damage">
                            non-damaging only
                        </span>
                    </Label>
                </FormGroup>

                <FormGroup check>
                    <Input
                        type="checkbox"
                        id={sameTypeId}
                        checked={this.state.sameTypeOnly}
                        onChange={() => this.toggleSameTypeOnly()} />

                    <Label for={sameTypeId} check>
                        <span title="Only show moves of the Pokemon's type">
                            same type only
                        </span>
                    </Label>
                </FormGroup>
            </div>
        )
    }

    /**
     * Toggles the damaging only filter.
     */
    toggleDamagingOnly() {
        this.setState(previousState => ({
            damagingOnly: !previousState.damagingOnly,
            nonDamagingOnly: false
        }))
    }

    /**
     * Toggles the non-damaging only filter.
     */
    toggleNonDamagingOnly() {
        this.setState(previousState => ({
            damagingOnly: false,
            nonDamagingOnly: !previousState.nonDamagingOnly
        }))
    }

    /**
     * Toggles the same type only filter.
     */
    toggleSameTypeOnly() {
        this.setState(previousState => ({
            sameTypeOnly: !previousState.sameTypeOnly
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

                // some moves damage but don't have a constant base power, e.g. Low Kick
                if (isStab && move.power !== null) {
                    let sameTypeElement = (
                        <span title="same-type attack bonus">
                            <b>{move.power * 1.5}</b>
                        </span>
                    )

                    powerElement = (
                        <div>
                            Power: {move.power} ({sameTypeElement})
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

        // no moves to show...
        if (this.hasFilters()) {
            return (
                <ListGroup className="overflow-y">
                    <ListGroupItem>
                        All moves have been filtered
                    </ListGroupItem>
                </ListGroup>
            )
        }

        return (
            <ListGroup className="overflow-y">
                <ListGroupItem>
                    No moves in this game version
                </ListGroupItem>
            </ListGroup>
        )
    }

    /**
     * Returns the moves to display.
     */
    getMovesToShow() {
        let moves = this.state.moves

        if (this.state.damagingOnly) {
            moves = moves.filter(m => m.isDamaging())
        }

        if (this.state.nonDamagingOnly) {
            moves = moves.filter(m => !m.isDamaging())
        }

        if (this.state.sameTypeOnly) {
            moves = moves.filter(m => this.isSameType(m))
        }

        return moves
    }

    /**
     * Returns whether the given move has a type that the current Pokemon has.
     */
    isSameType(move: MoveEntry) {
        return this.props.typeIds.includes(move.type.id)
    }

    /**
     * Returns whether the given move has STAB.
     */
    isStab(move: MoveEntry) {
        return move.isDamaging() && this.isSameType(move)
    }

    /**
     * Returns whether any filters are active.
     */
    hasFilters() {
        return this.state.damagingOnly
            || this.state.nonDamagingOnly
            || this.state.sameTypeOnly
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