import React, { Component } from "react"
import fuzzysort from "fuzzysort"
import { ListGroup, ListGroupItem, Button, Collapse, Input, Label, ButtonGroup } from "reactstrap"
import { TiStarburstOutline, TiSpiral, TiWaves } from "react-icons/ti"
import key from "weak-key"

import { IHasCommon, IHasSearch } from "../CommonMembers"

import { ItemEntry } from "../../models/ItemEntry"
import { MoveEntry, PokemonMoveContext } from "../../models/MoveEntry"
import { MoveLearnMethodEntry } from "../../models/MoveLearnMethodEntry"
import { WithId } from "../../models/WithId"

import { CookieHelper } from "../../util/CookieHelper"

import "./MoveList.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"

/**
 * Enum for selecting a move class.
 */
enum MoveClass {
    /**
     * All moves.
     */
    All = 'all',

    /**
     * Damaging moves.
     */
    Damaging = 'damaging',

    /**
     * Non-damaging moves.
     */
    NonDamaging = 'non-damaging'
}

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

interface IMoveListState extends IHasSearch {
    /**
     * The class of moves to show.
     */
    moveClass: MoveClass

    /**
     * Whether to only show moves with at least a minimum base power.
     */
    useMinPower: boolean

    /**
     * The minimum power a move must have to be shown.
     */
    minPower: number

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
    movesAreOpen: WithId<boolean>[]
}

/**
 * Component for displaying a Pokemon's moves.
 */
export class MoveList extends Component<IMoveListProps, IMoveListState> {
    constructor(props: IMoveListProps) {
        super(props)

        let index= this.props.index
        this.state = {
            moveClass: CookieHelper.get(`moveClass${index}`) as MoveClass,
            useMinPower: CookieHelper.getFlag(`useMinPower${index}`),
            minPower: CookieHelper.getNumber(`minPower${index}`) ?? 0,
            sameTypeOnly: CookieHelper.getFlag(`sameTypeOnly${index}`),
            levelUpOnly: CookieHelper.getFlag(`levelUpOnly${index}`),
            moves: [],
            loadingMoves: false,
            movesAreOpen: [],
            searchTerm: ""
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
                <div className="flex margin-top-small">
                    {this.renderFilters()}
                    {this.renderSearchBar()}
                </div>

                <div className="move-list margin-top-small">
                    {this.renderMoves()}
                </div>
            </div>
        )
    }

    /**
     * Renders the filters.
     */
    renderFilters() {
        let minPowerId = "minPowerCheckbox" + this.props.index

        let movePowers = this.state.moves.filter(m => m.power !== null)
                                         .map(m => m.power!)
        let lowestPower = Math.min(...movePowers)
        let highestPower = Math.max(...movePowers)

        let minPower = Math.min(Math.max(this.state.minPower, lowestPower), highestPower)

        let sameTypeId = "sameTypeCheckbox" + this.props.index
        let levelUpId = "levelUpCheckbox" + this.props.index

        return (
            <div className="moveFilter">
                <div className="separate-right">
                    <div>
                        {this.renderClassButtonGroup()}
                    </div>

                    <div className="flex-center margin-top-small">
                        <Input
                            className="filterCheckbox"
                            type="checkbox"
                            id={minPowerId}
                            checked={this.state.useMinPower}
                            disabled={this.state.moveClass !== MoveClass.Damaging}
                            onChange={() => this.toggleUseMinPower()} />

                        <Label
                            check
                            for={minPowerId}
                            className="margin-right-small">
                            <span title={`Only show moves with at least ${minPower} power`}>
                                minimum power
                            </span>
                        </Label>

                        <Input
                            type="number"
                            className="minPowerFilterInput"
                            disabled={this.state.moveClass !== MoveClass.Damaging || !this.state.useMinPower}
                            onChange={e => this.setMinPower(+e.target.value)}
                            min={lowestPower}
                            value={minPower}
                            max={highestPower} />
                    </div>
                </div>

                <div className="separate-right">
                    <div>
                        <Input
                            className="filterCheckbox"
                            type="checkbox"
                            id={sameTypeId}
                            checked={this.state.sameTypeOnly}
                            onChange={() => this.toggleSameTypeOnly()} />

                        <Label for={sameTypeId} check>
                            <span title="Only show moves of the Pokemon's type">
                                same type only
                            </span>
                        </Label>
                    </div>

                    <div className="margin-top-small">
                        <Input
                            className="filterCheckbox"
                            type="checkbox"
                            id={levelUpId}
                            checked={this.state.levelUpOnly}
                            onChange={() => this.toggleLevelUpOnly()} />

                        <Label for={levelUpId} check>
                            <span title="Only show moves learnt by level-up">
                                level-up only
                            </span>
                        </Label>
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Renders the button group for selecting the class of move to display.
     */
    renderClassButtonGroup() {
        let buttons = []
        for (let c of Object.values(MoveClass)){
            buttons.push(
                <Button
                    className="moveClassButton"
                    color={this.state.moveClass === c ? "success" : "secondary"}
                    onClick={() => this.setClass(c)}>
                    {c}
                </Button>
            )
        }

        return (
            <ButtonGroup>
                {buttons}
            </ButtonGroup>
        )
    }

    /**
     * Sets the move class.
     */
    setClass(moveClass: MoveClass) {
        CookieHelper.set(`moveClass${this.props.index}`, moveClass)
        this.setState({ moveClass: moveClass })
    }

    /**
     * Toggles the minimum power filter.
     */
    toggleUseMinPower() {
        CookieHelper.set(`useMinPower${this.props.index}`, !this.state.useMinPower)

        this.setState(previousState => ({
            useMinPower: !previousState.useMinPower
        }))
    }

    /**
     * Sets the minimum power.
     */
    setMinPower(minPower: number) {
        CookieHelper.set(`minPower${this.props.index}`, minPower)
        this.setState({ minPower: minPower })
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
     * Renders the search bar.
     */
    renderSearchBar() {
        return (
            <div className="movesSearchBarContainer flex-center">
                <Input
                    className="movesSearchBar"
                    placeholder="search"
                    onChange={e => this.setSearchTerm(e.target.value)} />
            </div>
        )
    }

    /**
     * Sets the search term.
     */
    setSearchTerm(term: string) {
        this.setState({ searchTerm: term })
    }

    /**
     * Filters the given list of moves according to the current search term.
     */
    filterMoveEntries(entries: PokemonMoveContext[]) {
        let searchTerm = this.state.searchTerm
        if (searchTerm === "") {
            return entries
        }

        let entryNames = entries.map(e => ({ id: e.moveId, name: e.getDisplayName("en") }))
        const options = { key: 'name' }
        let results = fuzzysort.go(searchTerm, entryNames, options)

        let resultIds = results.map(r => r.obj.id)
        return entries.filter(e => resultIds.includes(e.moveId))
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
        let filteredMoves = this.filterMoveEntries(moves)
        if (this.props.showMoves && filteredMoves.length > 0) {
            let rows = []
            for (let row = 0; row < filteredMoves.length; row++) {
                let move = filteredMoves[row]
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
                else if (move.learnMachines !== null) {
                    let machinesSummary = move.learnMachines.map(m => m.getDisplayName("en") ?? "Machine").join(", ")
                    moveMethod = `(${machinesSummary})`
                }
                else {
                    let methodsSummary = move.methods.map(m => m.getDisplayName("en")).join(", ")
                    moveMethod = `(${methodsSummary})`
                }

                const openInfoPane = () => this.toggleMoveOpen(move.moveId)
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

                let isOpen = this.state.movesAreOpen.find(e => e.id === move.moveId)?.data ?? false
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
                        <div className="flex moveInfo">
                            <div className="separate-right">
                                <div className="flex-center">
                                    {typeIcon}
                                    {damageClassIcon}
                                </div>

                                <hr />

                                <div>
                                    {powerElement}
                                    <div>Accuracy: {move.accuracy ?? "-"}</div>
                                    <div>PP: {move.pp ?? "-"}</div>
                                </div>
                            </div>

                            <div className="text-align-center flex-center">
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

        if (this.state.moveClass === MoveClass.Damaging) {
            moves = moves.filter(m => m.isDamaging())

            if (this.state.useMinPower) {
                moves = moves.filter(m => m.power !== null && m.power >= this.state.minPower)
            }
        }

        if (this.state.moveClass === MoveClass.NonDamaging) {
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
            // then machines in ascending order
            if (m1.learnMachines === null && m2.learnMachines === null) {
                return this.sortLearnMethods(m1.methods, m2.methods)
            }

            if (m1.learnMachines === null) {
                return 1
            }

            if (m2.learnMachines === null) {
                return -1
            }

            // ordering by item ID doesn't work so do it by item name
            return this.sortMachines(m1.learnMachines, m2.learnMachines)
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
     * Sorts ordered lists of machines into ascending order.
     */
    sortMachines(machines1: ItemEntry[], machines2: ItemEntry[]) {
        let commonLength = Math.min(machines1.length, machines2.length)
        for (let i = 0; i < commonLength; i++) {
            let m1 = machines1[i], m2 = machines2[i]

            // ordering by item ID doesn't work so do it by item name
            let m1IsTm = m1.name.startsWith("tm")
            let m2IsTm = m2.name.startsWith("tm")
            if (m1IsTm === m2IsTm) {
                // both the same kind
                let diff = m1.name.localeCompare(m2.name)
                if (diff !== 0) {
                    return diff
                }

                continue
            }

            // m2 is an HM
            if (m1IsTm) {
                return -1
            }

            // m1 is an HM
            if (m2IsTm) {
                return 1
            }
        }

        // only thing that separates them is the number of machines
        return machines1.length - machines2.length
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
        return this.state.moveClass !== MoveClass.All
            || this.state.useMinPower
            || this.state.sameTypeOnly
            || this.state.levelUpOnly
    }

    /**
     * Toggles the move info pane with the given index.
     */
    toggleMoveOpen(id: number) {
        let newMovesAreOpen = this.state.movesAreOpen.map(item => {
            if (item.id === id) {
                return new WithId<boolean>(id, !item.data)
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
                        movesAreOpen: concreteMoves.map(m => new WithId<boolean>(m.moveId, false))
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