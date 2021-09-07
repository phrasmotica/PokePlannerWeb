import React, { useEffect, useState } from "react"
import fuzzysort from "fuzzysort"
import { ListGroup, ListGroupItem, Button, Collapse, Input, Label, ButtonGroup } from "reactstrap"
import { TiStarburstOutline, TiSpiral, TiWaves } from "react-icons/ti"
import key from "weak-key"

import { IHasCommon, IsOpenDict } from "../CommonMembers"

import { getDisplayName, getFlavourText } from "../../models/Helpers"

import {
    ItemEntry,
    MoveEntry,
    MoveLearnMethodEntry,
    PokemonMoveContext,
    VersionGroupInfo
} from "../../models/swagger"

import { CssHelper } from "../../util/CssHelper"

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

interface MoveListProps extends IHasCommon {
    versionGroup: VersionGroupInfo | undefined

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

/**
 * Component for displaying a Pokemon's moves.
 */
export const MoveList = (props: MoveListProps) => {
    const [moveClass, setMoveClass] = useState(MoveClass.All)

    const [useMinPower, setUseMinPower] = useState(false)
    const [minPower, setMinPower] = useState(0)

    const [sameTypeOnly, setSameTypeOnly] = useState(false)
    const [levelUpOnly, setLevelUpOnly] = useState(false)

    const [moves, setMoves] = useState<PokemonMoveContext[]>([])
    const [loadingMoves, setLoadingMoves] = useState(false)
    const [movesAreOpen, setMovesAreOpen] = useState<IsOpenDict>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchMoves = () => {
            let versionGroupId = props.versionGroup?.versionGroupId
            if (versionGroupId === undefined) {
                return
            }

            let pokemonId = props.pokemonId
            if (pokemonId !== undefined) {
                console.log(`Move list ${props.index}: getting moves for Pokemon ${pokemonId}...`)
                setLoadingMoves(true)

                // get moves
                fetch(`${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/moves/${versionGroupId}`)
                    .then(response => {
                        if (response.status === 200) {
                            return response
                        }

                        throw new Error(`Move list ${props.index}: tried to get moves for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                    })
                    .then(response => response.json())
                    .then((moves: PokemonMoveContext[]) => {
                        setMoves(moves)
                        setMovesAreOpen(moves.map(m => ({ id: m.moveId, data: false })))
                    })
                    .catch(error => console.error(error))
                    .then(() => setLoadingMoves(false))
            }
        }

        fetchMoves()

        return () => setMoves([])
    }, [props.index, props.pokemonId, props.versionGroup])

    /**
     * Renders the filters.
     */
    const renderFilters = () => {
        let minPowerId = "minPowerCheckbox" + props.index

        let movePowers = moves.filter(m => m.power !== undefined)
                              .map(m => m.power!)
        let lowestPower = 0
        let highestPower = 0
        if (movePowers.length > 0) {
            lowestPower = Math.min(...movePowers)
            highestPower = Math.max(...movePowers)
        }

        let actualMinPower = Math.min(Math.max(minPower, lowestPower), highestPower)

        let sameTypeId = "sameTypeCheckbox" + props.index
        let levelUpId = "levelUpCheckbox" + props.index

        return (
            <div className="moveFilter">
                <div className="separate-right">
                    <div>
                        {renderClassButtonGroup()}
                    </div>

                    <div className="flex-center margin-top-small">
                        <Input
                            className="filterCheckbox"
                            type="checkbox"
                            id={minPowerId}
                            checked={useMinPower}
                            disabled={!props.showMoves || moveClass !== MoveClass.Damaging}
                            onChange={toggleUseMinPower} />

                        <Label
                            check
                            for={minPowerId}
                            className="margin-right-small">
                            <span title={`Only show moves with at least ${actualMinPower} power`}>
                                minimum power
                            </span>
                        </Label>

                        <Input
                            type="number"
                            className="minPowerFilterInput"
                            disabled={!props.showMoves || moveClass !== MoveClass.Damaging || !useMinPower}
                            onChange={e => setMinPower(+e.target.value)}
                            min={lowestPower}
                            value={actualMinPower}
                            max={highestPower} />
                    </div>
                </div>

                <div className="separate-right">
                    <div>
                        <Input
                            className="filterCheckbox"
                            type="checkbox"
                            id={sameTypeId}
                            checked={sameTypeOnly}
                            disabled={!props.showMoves}
                            onChange={toggleSameTypeOnly} />

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
                            checked={levelUpOnly}
                            disabled={!props.showMoves}
                            onChange={toggleLevelUpOnly} />

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
    const renderClassButtonGroup = () => {
        let buttons = []
        for (let c of Object.values(MoveClass)){
            buttons.push(
                <Button
                    key={c}
                    className="moveClassButton"
                    color={moveClass === c ? "success" : "secondary"}
                    disabled={!props.showMoves}
                    style={CssHelper.defaultCursorIf(!props.showMoves)}
                    onClick={() => setMoveClass(c)}>
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

    const toggleUseMinPower = () => setUseMinPower(!useMinPower)
    const toggleSameTypeOnly = () => setSameTypeOnly(!sameTypeOnly)
    const toggleLevelUpOnly = () => setLevelUpOnly(!levelUpOnly)

    const searchBar = (
        <div className="movesSearchBarContainer flex-center">
            <Input
                className="movesSearchBar"
                placeholder="search"
                disabled={!props.showMoves}
                onChange={e => setSearchTerm(e.target.value)} />
        </div>
    )

    /**
     * Filters the given list of moves according to the current search term.
     */
    const filterMoveEntries = (entries: PokemonMoveContext[]) => {
        if (searchTerm === "") {
            return entries
        }

        let entryNames = entries.map(e => ({ id: e.moveId, name: getDisplayName(e, "en") }))
        const options = { key: 'name' }
        let results = fuzzysort.go(searchTerm, entryNames, options)

        let resultIds = results.map(r => r.obj.id)
        return entries.filter(e => resultIds.includes(e.moveId))
    }

    /**
     * Renders the moves.
     */
    const renderMoves = () => {
        let versionGroupId = props.versionGroup?.versionGroupId
        if (versionGroupId === undefined) {
            return (
                <ListGroup className="movesListGroup">
                    <ListGroupItem>
                        -
                    </ListGroupItem>
                </ListGroup>
            )
        }

        if (props.pokemonId === undefined) {
            return (
                <ListGroup className="movesListGroup">
                    <ListGroupItem>
                        -
                    </ListGroupItem>
                </ListGroup>
            )
        }

        if (loadingMoves) {
            return (
                <ListGroup className="movesListGroup">
                    <ListGroupItem>
                        Loading...
                    </ListGroupItem>
                </ListGroup>
            )
        }

        let moves = getMovesToShow()
        let filteredMoves = filterMoveEntries(moves)
        if (props.showMoves && filteredMoves.length > 0) {
            let rows = []
            for (let row = 0; row < filteredMoves.length; row++) {
                let move = filteredMoves[row]
                let moveName = getDisplayName(move, "en") ?? move.name

                let moveNameElement = (
                    <span>
                        {moveName}
                    </span>
                )

                if (isStab(move)) {
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
                else if (move.learnMachines.length > 0) {
                    let machinesSummary = move.learnMachines.map(m => getDisplayName(m, "en") ?? m.name).join(", ")
                    moveMethod = `(${machinesSummary})`
                }
                else {
                    let methodsSummary = move.methods.map(m => getDisplayName(m, "en")).join(", ")
                    moveMethod = `(${methodsSummary})`
                }

                const openInfoPane = () => toggleMoveOpen(move.moveId)
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

                let typeId = move.type.typeId
                let headerId = `movelist${props.index}move${move.moveId}type${typeId}`
                let typeIcon = <img
                                id={headerId}
                                className="type-icon padded"
                                alt={`type${typeId}`}
                                src={require(`../../images/typeIcons/${typeId}-small.png`)} />

                let damageClassIcon = getDamageClassIcon(move.damageClass.moveDamageClassId)

                let isOpen = movesAreOpen.find(e => e.id === move.moveId)?.data ?? false
                let powerElement = <div>Power: {move.power ?? "-"}</div>

                // some moves damage but don't have a constant base power, e.g. Low Kick
                if (isStab(move) && move.power !== undefined) {
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
                                {getFlavourText(move, versionGroupId, "en")}
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
        if (hasFilters()) {
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
    const getMovesToShow = () => {
        let filteredMoves = moves

        if (moveClass === MoveClass.Damaging) {
            filteredMoves = filteredMoves.filter(m => isDamaging(m))

            if (useMinPower) {
                filteredMoves = filteredMoves.filter(m => m.power !== undefined && m.power >= minPower)
            }
        }

        if (moveClass === MoveClass.NonDamaging) {
            filteredMoves = filteredMoves.filter(m => !isDamaging(m))
        }

        if (sameTypeOnly) {
            filteredMoves = filteredMoves.filter(m => isSameType(m))
        }

        if (levelUpOnly) {
            filteredMoves = filteredMoves.filter(m => m.level > 0)
        }

        return filteredMoves.sort((m1, m2) => sortMoves(m1, m2))
    }

    /**
     * Sorts moves into ascending order.
     */
    const sortMoves = (m1: PokemonMoveContext, m2: PokemonMoveContext) => {
        // level-up moves in ascending order first, then the rest
        if (m1.level === 0 && m2.level === 0) {
            // then machines in ascending order
            if (m1.learnMachines?.length <= 0 && m2.learnMachines?.length <= 0) {
                return sortLearnMethods(m1.methods, m2.methods)
            }

            if (m1.learnMachines?.length <= 0) {
                return 1
            }

            if (m2.learnMachines?.length <= 0) {
                return -1
            }

            // ordering by item ID doesn't work so do it by item name
            return sortMachines(m1.learnMachines, m2.learnMachines)
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
    const sortLearnMethods = (m1: MoveLearnMethodEntry[], m2: MoveLearnMethodEntry[]) => {
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
    const sortMachines = (machines1: ItemEntry[], machines2: ItemEntry[]) => {
        if (machines1 === undefined || machines2 === undefined) {
            return 0
        }

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
     * Returns whether the given move is damaging.
     */
    const isDamaging = (move: MoveEntry) => {
        let damagingCategoryIds = [
            0, // damage
            4, // damage+ailment
            6, // damage+lower
            7, // damage+raise
            8, // damage+heal
            9, // one-hit KO
        ]

        return damagingCategoryIds.includes(move.category.moveCategoryId)
    }

    /**
     * Returns whether the given move has a type that the current Pokemon has.
     */
    const isSameType = (move: MoveEntry) => {
        return props.typeIds.includes(move.type.typeId)
    }

    /**
     * Returns whether the given move has STAB.
     */
    const isStab = (move: MoveEntry) => {
        return isDamaging(move) && isSameType(move)
    }

    /**
     * Returns whether any filters are active.
     */
    const hasFilters = () => {
        return moveClass !== MoveClass.All
            || useMinPower
            || sameTypeOnly
            || levelUpOnly
    }

    /**
     * Toggles the move info pane with the given index.
     */
    const toggleMoveOpen = (id: number) => {
        let newMovesAreOpen = movesAreOpen.map(item => {
            if (item.id === id) {
                return ({ id: id, data: !item.data })
            }

            return item
        })

        setMovesAreOpen(newMovesAreOpen)
    }

    /**
     * Returns an icon for the damage class with the given ID.
     */
    const getDamageClassIcon = (damageClassId: number) => {
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
                    `Move list ${props.index}: no move damage class with ID ${damageClassId} exists!`
                )
        }
    }

    return (
        <div className="move-list-container">
            <div className="flex margin-top-small">
                {renderFilters()}
                {searchBar}
            </div>

            <div className="move-list margin-top-small">
                {renderMoves()}
            </div>
        </div>
    )
}
