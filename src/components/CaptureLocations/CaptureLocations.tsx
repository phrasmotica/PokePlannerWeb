import React, { useEffect, useState } from "react"
import fuzzysort from "fuzzysort"
import { ListGroup, ListGroupItem, Button, Collapse, Input } from "reactstrap"
import key from "weak-key"

import { IHasIndex, IHasHideTooltips, IsOpenDict } from "../CommonMembers"

import { getDisplayName, getDisplayNameOfVersion } from "../../models/Helpers"

import {
    EncounterEntry,
    EncounterMethodDetails,
    EncountersEntry,
    PokemonSpeciesEntry,
    VersionGroupInfo
} from "../../models/swagger"

import { NumberHelper, Interval } from "../../util/NumberHelper"

import "./CaptureLocations.scss"
import "./../TeamBuilder/TeamBuilder.scss"

interface CaptureLocationsProps extends IHasIndex, IHasHideTooltips {
    /**
     * The version group.
     */
    versionGroup: VersionGroupInfo | undefined

    /**
     * The version group.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * The ID of the Pokemon to show capture locations for.
     */
    pokemonId: number | undefined

    /**
     * Whether to show the capture locations.
     */
    showLocations: boolean
}

/**
 * Renders a Pokemon's capture locations.
 */
export const CaptureLocations = (props: CaptureLocationsProps) => {
    const [locations, setLocations] = useState<EncountersEntry>()
    const [loadingLocations, setLoadingLocations] = useState(false)
    const [locationTooltipOpen, setLocationTooltipOpen] = useState<boolean[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [encountersAreOpen, setEncountersAreOpen] = useState<IsOpenDict>([])

    // refresh capture locations if the Pokemon ID changed
    useEffect(() => {
        const fetchCaptureLocations = () => {
            let pokemonId = props.pokemonId
            if (pokemonId === undefined) {
                setLocations(undefined)
                return
            }

            console.log(`Capture locations ${props.index}: getting capture locations for Pokemon ${pokemonId}...`)
            setLoadingLocations(true)

            // get encounter data
            fetch(`${process.env.REACT_APP_API_URL}/encounter/${pokemonId}`)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Capture locations ${props.index}: tried to get capture locations for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then((encounters: EncountersEntry) => {
                    let versionGroupId = props.versionGroup?.versionGroupId
                    let relevantEncounters = encounters.encounters.find(
                        e => e.id === versionGroupId
                    )?.data ?? []

                    setLocations(encounters)
                    setEncountersAreOpen(relevantEncounters.map(
                        e => ({ id: e.locationAreaId, data: false })
                    ))
                })
                .catch(error => console.error(error))
                .then(() => setLoadingLocations(false))
        }

        fetchCaptureLocations()

        return () => setLocations(undefined)
    }, [props.index, props.versionGroup, props.pokemonId])

    // close all encounters components if the version group ID changes
    useEffect(() => {
        const closeEncounterComponents = () => {
            let encounters = locations?.encounters?.find(
                e => e.id === props.versionGroup?.versionGroupId
            )?.data ?? []

            setEncountersAreOpen(encounters.map(e => ({ id: e.locationAreaId, data: false })))
        }

        closeEncounterComponents()

        return () => setEncountersAreOpen([])
    }, [props.versionGroup, locations])

    /**
     * Renders the species' catch rate.
     */
    const renderCatchRate = () => {
        let catchRateElement = "-"

        let species = props.species
        if (species !== undefined) {
            catchRateElement = `${species.catchRate}`
        }

        return (
            <div className="catchRate flex-center">
                Catch rate: {catchRateElement}
            </div>
        )
    }

    /**
     * Renders the search bar.
     */
    const renderSearchBar = () => {
        return (
            <div className="encountersSearchBarContainer flex-center">
                <Input
                    className="encountersSearchBar"
                    placeholder="search"
                    disabled={!props.showLocations}
                    onChange={e => setSearchTerm(e.target.value)} />
            </div>
        )
    }

    /**
     * Renders the Pokemon's capture locations.
     */
    const renderCaptureLocations = () => {
        if (loadingLocations) {
            return (
                <ListGroup className="encountersListGroup">
                    <ListGroupItem>
                        Loading...
                    </ListGroupItem>
                </ListGroup>
            )
        }

        let encountersElement = (
            <ListGroup className="encountersListGroup">
                <ListGroupItem>
                    -
                </ListGroupItem>
            </ListGroup>
        )

        if (props.showLocations && hasPokemon()) {
            encountersElement = (
                <ListGroup className="encountersListGroup">
                    <ListGroupItem>
                        No capture locations in this version group
                    </ListGroupItem>
                </ListGroup>
            )

            if (locations !== undefined) {
                let versionGroupId = props.versionGroup?.versionGroupId
                let matchingEncounter = locations.encounters.find(e => e.id === versionGroupId)
                if (matchingEncounter === undefined) {
                    return encountersElement
                }

                let encountersData = matchingEncounter.data
                let filteredData = filterEncounterEntries(encountersData)

                let items = []
                if (filteredData.length > 0) {
                    for (let row = 0; row < filteredData.length; row++) {
                        let encounter = filteredData[row]
                        let encounterName = getDisplayName(encounter, "en") ?? `encounter`
                        let encounterNameElement = (
                            <span className="center-text">
                                <b>
                                    {encounterName}
                                </b>
                            </span>
                        )

                        let encounterId = encounter.locationAreaId
                        const openInfoPane = () => toggleEncounterOpen(encounterId)
                        let encounterNameButton = (
                            <Button
                                color="link"
                                onMouseUp={openInfoPane}>
                                {encounterNameElement}
                            </Button>
                        )

                        let versions = props.versionGroup?.versionInfo ?? []

                        let versionElements = versions.map(v => {
                            let versionName = getDisplayNameOfVersion(v)
                            let versionNameElement = (
                                <div className="captureLocationsVersionName">
                                    {versionName}
                                </div>
                            )

                            let methodElements = []
                            let versionDetails = encounter.details.find(e => e.id === v.versionId)
                            if (versionDetails === undefined) {
                                methodElements.push(<div>-</div>)
                            }
                            else {
                                let detailsList = versionDetails.data
                                methodElements = detailsList.map((details, index) => {
                                    return renderEncounterMethodDetails(
                                        details,
                                        index < detailsList.length - 1
                                    )
                                })
                            }

                            return (
                                <div
                                    key={key(v)}
                                    className="captureLocationsVersionItem">
                                    {versionNameElement}
                                    {methodElements}
                                </div>
                            )
                        })

                        let isOpen = encountersAreOpen.find(e => e.id === encounterId)?.data ?? false
                        let infoPane = (
                            <Collapse isOpen={isOpen}>
                                <div className="flex encounterInfo">
                                    {versionElements}
                                </div>
                            </Collapse>
                        )

                        items.push(
                            <ListGroupItem key={key(encounter)}>
                                {encounterNameButton}
                                {infoPane}
                            </ListGroupItem>
                        )
                    }
                }
                else {
                    if (hasFilters()) {
                        items.push(
                            <ListGroupItem key={0}>
                                All encounters have been filtered
                            </ListGroupItem>
                        )
                    }
                    else {
                        items.push(
                            <ListGroupItem key={0}>
                                -
                            </ListGroupItem>
                        )
                    }
                }

                return (
                    <ListGroup className="encountersListGroup">
                        {items}
                    </ListGroup>
                )
            }

            // TODO: show "evolve {preEvolution}" if applicable, else show "Trade"
        }

        return encountersElement
    }

    /**
     * Renders the encounter method details.
     */
    const renderEncounterMethodDetails = (details: EncounterMethodDetails, addSeparator = false) => {
        let methodName = getDisplayName(details.method, "en") ?? details.method.name
        let methodElement = <div>{methodName}</div>

        // don't bother showing 100% chance for gift Pokemon
        let showChance = ![18, 19].includes(details.method.encounterMethodId)

        let conditionValueElements = details.conditionValuesDetails.map((cvd, i) => {
            let conditionsElement = undefined
            if (cvd.conditionValues.length > 0) {
                let conditions = cvd.conditionValues.map(v => getDisplayName(v, "en") ?? v.name)
                                                    .join(", ")
                conditionsElement = <div>{conditions}</div>
            }

            let chanceElement = undefined
            if (showChance) {
                let chance = cvd.encounterDetails.map(ed => ed.chance)
                                                 .reduce((ed1, ed2) => ed1 + ed2)
                chanceElement = <div>{chance}% chance</div>
            }

            let levelRanges = cvd.encounterDetails.map(ed => new Interval(ed.minLevel, ed.maxLevel))
            let mergedLevelRanges = NumberHelper.mergeIntRanges(levelRanges)
            let intervalsSummary = mergedLevelRanges.map(i => i.summarise()).join(", ")

            let levelsElement = <div>level {intervalsSummary}</div>
            if (mergedLevelRanges.length > 1 || !mergedLevelRanges[0].isEmpty()) {
                levelsElement = <div>levels {intervalsSummary}</div>
            }

            let separator = undefined
            if (i < details.conditionValuesDetails.length - 1) {
                separator = <hr />
            }

            return (
                <div
                    key={key(cvd)}
                    className="conditionsContainer">
                    {conditionsElement}
                    {chanceElement}
                    {levelsElement}
                    {separator}
                </div>
            )
        })

        let separator = undefined
        if (addSeparator) {
            separator = <hr style={{ width: "90%" }} />
        }

        return (
            <div key={key(details)}>
                <div className="methodContainer">
                    {methodElement}
                </div>

                <div className="cveContainer">
                    {conditionValueElements}
                </div>

                {separator}
            </div>
        )
    }

    /**
     * Filters the given list of encounters according to the current search term.
     */
    const filterEncounterEntries = (entries: EncounterEntry[]) => {
        if (searchTerm === "") {
            return entries
        }

        let entryNames = entries.map(e => ({ id: e.locationAreaId, name: getDisplayName(e, "en") }))
        const options = { key: 'name' }
        let results = fuzzysort.go(searchTerm, entryNames, options)

        let resultIds = results.map(r => r.obj.id)
        return entries.filter(e => resultIds.includes(e.locationAreaId))
    }

    // toggle the location tooltip with the given index
    const toggleLocationTooltip = (index: number) => {
        let newLocationTooltipOpen = locationTooltipOpen.map((item, j) => {
            if (j === index) {
                return !item
            }

            return item
        })

        setLocationTooltipOpen(newLocationTooltipOpen)
    }

    /**
     * Toggles the encounter info pane with the given index.
     */
    const toggleEncounterOpen = (id: number) => {
        let newEncountersAreOpen = encountersAreOpen.map(item => {
            if (item.id === id) {
                return { id: id, data: !item.data }
            }

            return item
        })

        setEncountersAreOpen(newEncountersAreOpen)
    }

    // returns true if we have a Pokemon
    const hasPokemon = () => {
        return props.pokemonId !== undefined
    }

    /**
     * Returns whether any filters are active.
     */
    const hasFilters = () => {
        return searchTerm.length > 0
    }

    return (
        <div style={{ marginTop: 5 }}>
            <div className="topBar">
                {renderCatchRate()}
                {renderSearchBar()}
            </div>

            {renderCaptureLocations()}
        </div>
    )
}
