import React, { Component } from "react"
import { ListGroup, ListGroupItem, Button, Collapse, FormGroup, Input, Label } from "reactstrap"
import { TiStarburstOutline, TiSpiral, TiWaves } from "react-icons/ti"
import key from "weak-key"

import { IHasCommon } from "../CommonMembers"

import { MoveEntry, PokemonMoveContext } from "../../models/MoveEntry"
import { MoveLearnMethodEntry } from "../../models/MoveLearnMethodEntry"

import { CookieHelper } from "../../util/CookieHelper"

import "./MoveList.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"

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
     * Whether to only show moves learnt by level-up.
     */
    levelUpOnly: boolean

    /**
     * The moves to show.
     */
    moves: PokemonMoveContext[]

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
            damagingOnly: CookieHelper.getFlag(`damagingOnly${this.props.index}`),
            nonDamagingOnly: CookieHelper.getFlag(`nonDamagingOnly${this.props.index}`),
            sameTypeOnly: CookieHelper.getFlag(`sameTypeOnly${this.props.index}`),
            levelUpOnly: CookieHelper.getFlag(`levelUpOnly${this.props.index}`),
            moves: [],
            loadingMoves: false,
            movesAreOpen: []
        }
    }

    componentDidMount() {
        this.fetchMoves()
    }

    componentDidUpdate(previousProps: IMoveListProps) {
        // refresh move list if the version group changed...
        let previousVersionGroupId = previousProps.versionGroupId
        let versionGroupId = this.props.versionGroupId
        let versionGroupChanged = versionGroupId !== previousVersionGroupId

        // ...or if the Pokemon ID changed
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanged = pokemonId !== previousPokemonId

        if (versionGroupChanged || pokemonChanged) {
            this.fetchMoves()
        }
    }

    render() {
        return (
            <div className="move-list-container">
                <div style={{ marginTop: 4 }}>
                    {this.renderFilters()}
                </div>

                <div className="move-list" style={{ marginTop: 4 }}>
                    {this.renderMoves()}
                </div>
            </div>
        )
    }

    /**
     * Renders the filters.
     */
    renderFilters() {
        // TODO: filter by power and other metrics

        let damagingId = "damagingCheckbox" + this.props.index
        let nonDamagingId = "nonDamagingCheckbox" + this.props.index
        let sameTypeId = "sameTypeCheckbox" + this.props.index
        let levelUpId = "levelUpCheckbox" + this.props.index

        return (
            <div className="flex" style={{ marginLeft: 4 }}>
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

                <FormGroup
                    check
                    className="margin-right-small">
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

                <FormGroup check>
                    <Input
                        type="checkbox"
                        id={levelUpId}
                        checked={this.state.levelUpOnly}
                        onChange={() => this.toggleLevelUpOnly()} />

                    <Label for={levelUpId} check>
                        <span title="Only show moves learnt by level-up">
                            level-up only
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
        CookieHelper.set(`damagingOnly${this.props.index}`, !this.state.damagingOnly)
        CookieHelper.set(`nonDamagingOnly${this.props.index}`, false)

        this.setState(previousState => ({
            damagingOnly: !previousState.damagingOnly,
            nonDamagingOnly: false
        }))
    }

    /**
     * Toggles the non-damaging only filter.
     */
    toggleNonDamagingOnly() {
        CookieHelper.set(`damagingOnly${this.props.index}`, false)
        CookieHelper.set(`nonDamagingOnly${this.props.index}`, !this.state.nonDamagingOnly)

        this.setState(previousState => ({
            damagingOnly: false,
            nonDamagingOnly: !previousState.nonDamagingOnly
        }))
    }

    /**
     * Toggles the same type only filter.
     */
    toggleSameTypeOnly() {
        CookieHelper.set(`sameTypeOnly${this.props.index}`, !this.state.sameTypeOnly)

        this.setState(previousState => ({
            sameTypeOnly: !previousState.sameTypeOnly
        }))
    }

    /**
     * Toggles the level-up only filter.
     */
    toggleLevelUpOnly() {
        CookieHelper.set(`levelUpOnly${this.props.index}`, !this.state.levelUpOnly)

        this.setState(previousState => ({
            levelUpOnly: !previousState.levelUpOnly
        }))
    }

    /**
     * Renders the moves.
     */
    renderMoves() {
        if (this.props.pokemonId === undefined) {
            return (
                <ListGroup className="movesListGroup">
                    <ListGroupItem>
                        -
                    </ListGroupItem>
                </ListGroup>
            )
        }

        if (this.state.loadingMoves) {
            return (
                <ListGroup className="movesListGroup">
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

                let moveNameElement = (
                    <span>
                        {moveName}
                    </span>
                )

                let isStab = this.isStab(move)
                if (isStab) {
                    moveNameElement = (
                        <span>
                            <b>
                                {moveName}
                            </b>
                        </span>
                    )
                }

                let moveMethod = ""
                if (move.level > 0) {
                    moveMethod = `(level ${move.level})`
                }
                else {
                    let methodsSummary = move.methods.map(m => m.getDisplayName("en")).join(", ")
                    moveMethod = `(${methodsSummary})`
                }

                const openInfoPane = () => this.toggleMoveOpen(row)
                let moveNameButton = (
                    <div className="flex">
                        <Button
                            color="link"
                            onMouseUp={openInfoPane}>
                            {moveNameElement}
                        </Button>

                        <span>
                            {moveMethod}
                        </span>
                    </div>
                )

                let typeId = move.type.id
                let headerId = `movelist${this.props.index}move${move.moveId}type${typeId}`
                let typeIcon = <img
                                id={headerId}
                                className="type-icon padded"
                                alt={`type${typeId}`}
                                src={require(`../../images/typeIcons/${typeId}-small.png`)} />

                let damageClassIcon = this.getDamageClassIcon(move.damageClass.id)

                let isOpen = this.state.movesAreOpen[row]
                let powerElement = <div>Power: {move.power ?? "-"}</div>

                // some moves damage but don't have a constant base power, e.g. Low Kick
                if (isStab && move.power !== null) {
                    let sameTypeElement = (
                        <abbr title="same-type attack bonus">
                            <b>{move.power * 1.5}</b>
                        </abbr>
                    )

                    powerElement = (
                        <div>
                            Power: {move.power} ({sameTypeElement})
                        </div>
                    )
                }

                let infoPane = (
                    <Collapse isOpen={isOpen}>
                        <div className="flex">
                            <div className="margin-right-small">
                                <div className="flex-center">
                                    {typeIcon}
                                    {damageClassIcon}
                                </div>

                                {powerElement}

                                <div>Accuracy: {move.accuracy ?? "-"}</div>
                                <div>PP: {move.pp ?? "-"}</div>
                            </div>

                            <div className="text-align-center margin-right-small">
                                {move.getFlavourText(this.props.versionGroupId!, "en")}
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
                <ListGroup className="movesListGroup">
                    {rows}
                </ListGroup>
            )
        }

        // no moves to show...
        if (this.hasFilters()) {
            return (
                <ListGroup className="movesListGroup">
                    <ListGroupItem>
                        All moves have been filtered
                    </ListGroupItem>
                </ListGroup>
            )
        }

        return (
            <ListGroup className="movesListGroup">
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

        if (this.state.levelUpOnly) {
            moves = moves.filter(m => m.level > 0)
        }

        return moves.sort((m1, m2) => this.sortMoves(m1, m2))
    }

    /**
     * Sorts moves into ascending order.
     */
    sortMoves(m1: PokemonMoveContext, m2: PokemonMoveContext) {
        // level-up moves in ascending order first, then the rest
        if (m1.level === 0 && m2.level === 0) {
            return this.sortLearnMethods(m1.methods, m2.methods)
        }

        if (m1.level === 0) {
            return 1
        }

        if (m2.level === 0) {
            return -1
        }

        return m1.level - m2.level
    }

    /**
     * Sorts ordered lists of move learn methods into ascending order.
     */
    sortLearnMethods(m1: MoveLearnMethodEntry[], m2: MoveLearnMethodEntry[]) {
        // order of importance for move learn methods
        const order = [1, 4, 3, 2, 5, 6, 7, 8, 9, 10]

        let m1Indices = m1.map(m => order.indexOf(m.moveLearnMethodId))
        let m2Indices = m2.map(m => order.indexOf(m.moveLearnMethodId))

        // sorts by the importance of all learn method (lexicographically)
        let commonLength = Math.min(m1Indices.length, m2Indices.length)
        for (let i = 0; i < commonLength; i++) {
            let diff = m1Indices[i] - m2Indices[i]
            if (diff !== 0) {
                return diff
            }
        }

        // only thing that separates them is the number of methods
        return m1Indices.length - m2Indices.length
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
                return (
                    <span title="Status">
                        <TiWaves className="damage-class-small" />
                    </span>
                )
            case 2:
                // physical
                return (
                    <span title="Physical">
                        <TiStarburstOutline className="damage-class-small" />
                    </span>
                )
            case 3:
                // special
                return (
                    <span title="Special">
                        <TiSpiral className="damage-class-small" />
                    </span>
                )
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
                .then((moves: PokemonMoveContext[]) => {
                    let concreteMoves = moves.map(PokemonMoveContext.from)
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