import React, { useEffect, useState } from 'react'
import { Input, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'

import { PokedexPanel } from '../PokedexPanel/PokedexPanel'

import { getDisplayNameOfVersionGroup } from '../../models/Helpers'
import {
    GenerationInfo,
    PokemonSpeciesInfo,
    StatEntry,
    TypeInfo,
    VersionGroupInfo
} from '../../models/swagger'

/**
 * The number of Pokemon panels to show.
 * */
const TEAM_SIZE: number = 1

/**
 * Component for building a Pokemon team.
 */
export const TeamBuilder = () => {
    const [versionGroupId, setVersionGroupId] = useState<number>()

    const [speciesInfo, setSpeciesInfo] = useState<PokemonSpeciesInfo[]>([])
    const [loadingSpeciesInfo, setLoadingSpeciesInfo] = useState(false)
    const [generations, setGenerations] = useState<GenerationInfo[]>([])
    const [loadingGenerations, setLoadingGenerations] = useState(false)
    const [versionGroups, setVersionGroups] = useState<VersionGroupInfo[]>([])
    const [loadingVersionGroups, setLoadingVersionGroups] = useState(false)
    const [types, setTypes] = useState<TypeInfo[]>([])
    const [loadingTypes, setLoadingTypes] = useState(false)
    const [baseStats, setBaseStats] = useState<StatEntry[]>([])
    const [loadingBaseStats, setLoadingBaseStats] = useState(false)

    const [ignoreValidity, setIgnoreValidity] = useState(false)
    const [hideTooltips, setHideTooltips] = useState(false)

    // fetch generations, types and version groups on mount
    useEffect(() => {
        const fetchGenerations = () => {
            setLoadingGenerations(true)

            let languageId = 9
            fetch(`${process.env.REACT_APP_API_URL}/generationInfo/${languageId}`)
                .then(response => response.json())
                .then((generations: GenerationInfo[]) => setGenerations(generations))
                .catch(error => console.error(error))
                .finally(() => setLoadingGenerations(false))
        }

        const fetchTypes = () => {
            setLoadingTypes(true)

            let languageId = 9
            fetch(`${process.env.REACT_APP_API_URL}/typeInfo/${languageId}`)
                .then(response => response.json())
                .then((types: TypeInfo[]) => setTypes(types))
                .catch(error => console.error(error))
                .finally(() => setLoadingTypes(false))
        }

        const fetchVersionGroups = () => {
            setLoadingVersionGroups(true)

            let languageId = 9
            fetch(`${process.env.REACT_APP_API_URL}/versionGroupInfo/${languageId}`)
                .then(response => response.json())
                .then((versionGroups: VersionGroupInfo[]) => {
                    setVersionGroups(versionGroups)

                    let versionGroupId = versionGroups[versionGroups.length - 1].versionGroupId

                    setVersionGroupId(versionGroupId)
                })
                .catch(error => console.error(error))
                .finally(() => setLoadingVersionGroups(false))
        }

        fetchGenerations()
        fetchTypes()
        fetchVersionGroups()

        return () => {
            setGenerations([])
            setTypes([])
            setVersionGroups([])
        }
    }, [])

    // fetch species and base stats if the version group ID changes
    useEffect(() => {
        const fetchBaseStats = (versionGroupId: number | undefined) => {
            if (versionGroupId === undefined) {
                return
            }

            console.log(`Team builder: getting base stats for version group ${versionGroupId}...`)
            setLoadingBaseStats(true)

            fetch(`${process.env.REACT_APP_API_URL}/stat/${versionGroupId}`)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    // concrete types endpoint couldn't be found
                    throw new Error(`Team builder: couldn't get base stat names for version group ${versionGroupId}!`)
                })
                .then(response => response.json())
                .then((baseStats: StatEntry[]) => setBaseStats(baseStats))
                .catch(error => console.error(error))
                .then(() => setLoadingBaseStats(false))
        }

        const fetchSpeciesInfo = (versionGroupId: number | undefined) => {
            if (versionGroupId === undefined) {
                return
            }

            console.log(`Team builder: getting species info for version group ${versionGroupId}...`)
            setLoadingSpeciesInfo(true)

            let versionGroup = versionGroups.find(vg => vg.versionGroupId === versionGroupId)!
            let generationId = versionGroup.generationId
            let languageId = 9

            fetch(`${process.env.REACT_APP_API_URL}/speciesInfo/${generationId}/${languageId}`)
                .then(response => response.json())
                .then((speciesInfo: PokemonSpeciesInfo[]) => setSpeciesInfo(speciesInfo))
                .catch(error => console.error(error))
                .finally(() => setLoadingSpeciesInfo(false))
        }

        fetchBaseStats(versionGroupId)
        fetchSpeciesInfo(versionGroupId)

        return () => {
            setBaseStats([])
            setSpeciesInfo([])
        }
    }, [versionGroupId, versionGroups])

    const renderMenu = () => {
        if (pageIsLoading) {
            return null
        }

        let versionGroupMenu = renderVersionGroupMenu()

        return (
            <div className="flex">
                <div className="margin-right">
                    {versionGroupMenu}
                </div>
                <div className="margin-right">
                    {toggleSet}
                </div>
                <div>

                </div>
            </div>
        )
    }

    const renderVersionGroupMenu = () => {
        let options = versionGroups.map(vg => ({
            label: getDisplayNameOfVersionGroup(vg),
            value: vg.versionGroupId
        }))

        let defaultOption = options.filter(o => o.value === versionGroupId)

        return (
            <FormGroup>
                <Label for="versionGroupSelect">Game Version</Label>

                <Select
                    id="versionGroupSelect"
                    className="version-group-select"
                    defaultValue={defaultOption}
                    onChange={(option: any) => setVersionGroupId(option.value)}
                    options={options} />
            </FormGroup>
        )
    }

    // returns the set of toggles for the menu
    const toggleSet = (
        <div>
            <FormGroup check>
                <Input
                    type="checkbox"
                    id="ignoreValidityCheckbox"
                    checked={ignoreValidity}
                    onChange={() => toggleIgnoreValidity()} />
                <Label for="ignoreValidityCheckbox" check>
                    Ignore Pokemon validity in game version
                </Label>
            </FormGroup>

            <FormGroup check>
                <Input
                    type="checkbox"
                    id="hideTooltipsCheckbox"
                    checked={hideTooltips}
                    onChange={() => toggleHideTooltips()} />
                <Label for="hideTooltipsCheckbox" check>
                    Hide tooltips
                </Label>
            </FormGroup>
        </div>
    )

    const renderPokedexPanels = () => {
        let items = []

        for (let i = 0; i < TEAM_SIZE; i++) {
            items.push(
                <PokedexPanel
                    key={i}
                    index={i}
                    versionGroup={versionGroup}
                    ignoreValidity={ignoreValidity}
                    toggleIgnoreValidity={toggleIgnoreValidity}
                    hideTooltips={hideTooltips}
                    speciesInfo={speciesInfo}
                    loadingSpeciesInfo={loadingSpeciesInfo}
                    generations={generations}
                    types={types}
                    baseStats={baseStats} />
            )

            if (i < TEAM_SIZE - 1) {
                items.push(<hr></hr>)
            }
        }

        return <div>{items}</div>
    }

    const versionGroup = versionGroups.find(g => g.versionGroupId === versionGroupId)

    const toggleIgnoreValidity = () => setIgnoreValidity(!ignoreValidity)
    const toggleHideTooltips = () => setHideTooltips(!hideTooltips)

    const pageIsLoading = loadingBaseStats
                    || loadingVersionGroups
                    || loadingGenerations
                    || loadingTypes

    let pokedexPanels = pageIsLoading
        ? <p><em>Loading...</em></p>
        : renderPokedexPanels()

    return (
        <div>
            <p>Build your Pokemon team!</p>
            {renderMenu()}
            {pokedexPanels}
        </div>
    )
}
