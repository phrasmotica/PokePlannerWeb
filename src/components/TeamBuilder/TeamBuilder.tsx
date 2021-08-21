import React, { useEffect, useState } from 'react'
import { Input, FormGroup, Label } from 'reactstrap'
import Select from 'react-select'

import { PokedexPanel } from '../PokedexPanel/PokedexPanel'

import { getDisplayName } from '../../models/Helpers'
import { GenerationEntry, PokemonSpeciesEntry, PokemonSpeciesInfoEntry, StatEntry, TypeEntry, VersionGroupEntry } from '../../models/swagger'

import { CookieHelper } from '../../util/CookieHelper'

/**
 * The number of Pokemon panels to show.
 * */
const TEAM_SIZE: number = 1

/**
 * Component for building a Pokemon team.
 */
export const TeamBuilder = () => {
    const [versionGroupId, setVersionGroupId] = useState<number>()

    const [species, setSpecies] = useState<PokemonSpeciesEntry[]>([])
    const [loadingSpecies, setLoadingSpecies] = useState(false)
    const [speciesInfo, setSpeciesInfo] = useState<PokemonSpeciesInfoEntry>()
    const [loadingSpeciesInfo, setLoadingSpeciesInfo] = useState(false)
    const [generations, setGenerations] = useState<GenerationEntry[]>([])
    const [loadingGenerations, setLoadingGenerations] = useState(false)
    const [versionGroups, setVersionGroups] = useState<VersionGroupEntry[]>([])
    const [loadingVersionGroups, setLoadingVersionGroups] = useState(false)
    const [types, setTypes] = useState<TypeEntry[]>([])
    const [loadingTypes, setLoadingTypes] = useState(false)
    const [baseStats, setBaseStats] = useState<StatEntry[]>([])
    const [loadingBaseStats, setLoadingBaseStats] = useState(false)

    const [ignoreValidity, setIgnoreValidity] = useState(
        CookieHelper.getFlag("ignoreValidity")
    )

    const [hideTooltips, setHideTooltips] = useState(
        CookieHelper.getFlag("hideTooltips")
    )

    // fetch species, generations, types and version groups on mount
    useEffect(() => {
        const fetchSpecies = () => {
            console.log(`${new Date().toLocaleTimeString()} Fetching species info...`)
            setLoadingSpeciesInfo(true)

            fetch(constructSpeciesInfoEndpoint())
                .then(response => response.json())
                .then((speciesInfo: PokemonSpeciesInfoEntry) => setSpeciesInfo(speciesInfo))
                .catch(error => console.error(error))
                .finally(() => {
                    console.log(`${new Date().toLocaleTimeString()} Finished fetching species info!`)
                    setLoadingSpeciesInfo(false)
                })
        }

        const constructSpeciesInfoEndpoint = () => {
            let apiUrl = process.env.REACT_APP_API_URL

            let generationId = 8
            let languageId = 9
            let endpoint = `${apiUrl}/speciesInfo/${generationId}/${languageId}`

            return endpoint
        }

        const fetchGenerations = () => {
            setLoadingGenerations(true)

            fetch(`${process.env.REACT_APP_API_URL}/generation`)
                .then(response => response.json())
                .then((generations: GenerationEntry[]) => setGenerations(generations))
                .catch(error => console.error(error))
                .finally(() => setLoadingGenerations(false))
        }

        const fetchTypes = () => {
            setLoadingTypes(true)

            fetch(`${process.env.REACT_APP_API_URL}/type`)
                .then(response => response.json())
                .then((types: TypeEntry[]) => setTypes(types))
                .catch(error => console.error(error))
                .finally(() => setLoadingTypes(false))
        }

        const fetchVersionGroups = () => {
            setLoadingVersionGroups(true)

            fetch(`${process.env.REACT_APP_API_URL}/versionGroup`)
                .then(response => response.json())
                .then((versionGroups: VersionGroupEntry[]) => {
                    setVersionGroups(versionGroups)

                    // try get version group ID from cookies
                    let versionGroupId = CookieHelper.getNumber("versionGroupId")
                    if (versionGroupId === undefined) {
                        // fall back to latest one
                        versionGroupId = versionGroups[versionGroups.length - 1].versionGroupId
                    }

                    setVersionGroup(versionGroupId)
                })
                .catch(error => console.error(error))
                .finally(() => setLoadingVersionGroups(false))
        }

        fetchSpecies()
        fetchGenerations()
        fetchTypes()
        fetchVersionGroups()

        return () => {
            setSpecies([])
            setGenerations([])
            setTypes([])
            setVersionGroups([])
        }
    }, [])

    // fetch base stats if the version group ID changes
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

        fetchBaseStats(versionGroupId)

        return () => {
            setBaseStats([])
        }
    }, [versionGroupId])

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
            label: getDisplayName(vg, "en") ?? vg.name,
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
                    onChange={(option: any) => setVersionGroup(option.value)}
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
                    species={species}
                    speciesInfo={speciesInfo?.species ?? []}
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

    const setVersionGroup = (versionGroupId: number) => {
        setVersionGroupId(versionGroupId)

        // set cookie
        CookieHelper.set("versionGroupId", versionGroupId)
    }

    const toggleIgnoreValidity = () => {
        CookieHelper.set("ignoreValidity", !ignoreValidity)
        setIgnoreValidity(!ignoreValidity)
    }

    const toggleHideTooltips = () => {
        CookieHelper.set("hideTooltips", !hideTooltips)
        setHideTooltips(!hideTooltips)
    }

    const pageIsLoading = loadingSpecies
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
