import React, { useEffect, useState } from "react"
import { Checkbox, Form } from "semantic-ui-react"

import { PokedexPanel } from "../PokedexPanel/PokedexPanel"
import { VersionGroupSelector } from "../VersionGroupSelector/VersionGroupSelector"

import { getPokedexNumberOfSpecies } from "../../models/Helpers"
import { SpeciesInfo } from "../../models/SpeciesInfo"

import {
    GenerationInfo,
    PokemonSpeciesInfo,
    StatInfo,
    TypeInfo,
    VersionGroupInfo
} from "../../models/swagger"

/**
 * The number of Pokemon panels to show.
 * */
const TEAM_SIZE: number = 1

/**
 * Component for building a Pokemon team.
 */
export const TeamBuilder = () => {
    const [versionGroupId, setVersionGroupId] = useState<number>()

    const [speciesInfo, setSpeciesInfo] = useState<SpeciesInfo>(new SpeciesInfo([]))
    const [loadingSpeciesInfo, setLoadingSpeciesInfo] = useState(false)
    const [generations, setGenerations] = useState<GenerationInfo[]>([])
    const [loadingGenerations, setLoadingGenerations] = useState(false)
    const [versionGroups, setVersionGroups] = useState<VersionGroupInfo[]>([])
    const [loadingVersionGroups, setLoadingVersionGroups] = useState(false)
    const [types, setTypes] = useState<TypeInfo[]>([])
    const [loadingTypes, setLoadingTypes] = useState(false)
    const [baseStats, setBaseStats] = useState<StatInfo[]>([])
    const [loadingBaseStats, setLoadingBaseStats] = useState(false)

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
                    setVersionGroupId(versionGroups[0].versionGroupId)
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

            let languageId = 9

            fetch(`${process.env.REACT_APP_API_URL}/statInfo/${languageId}`)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Team builder: couldn't get base stats for version group ${versionGroupId}!`)
                })
                .then(response => response.json())
                .then((baseStats: StatInfo[]) => setBaseStats(baseStats))
                .catch(error => console.error(error))
                .then(() => setLoadingBaseStats(false))
        }

        const fetchSpeciesInfo = (versionGroupId: number | undefined) => {
            if (versionGroupId === undefined) {
                return
            }

            // clear species info data when version group changes
            speciesInfo.clear()

            console.log(`Team builder: getting species info for version group ${versionGroupId}...`)
            setLoadingSpeciesInfo(true)

            let versionGroup = versionGroups.find(vg => vg.versionGroupId === versionGroupId)!
            let pokedexIds = versionGroup.versionGroupPokedexes.map(p => p.pokedex!.pokedexId)

            let languageId = 9

            // fetch species info from multiple pokedexes simultaneously
            Promise.all(
                pokedexIds.map(
                    id => {
                        console.log(`Team builder: getting species info for pokedex ${id}...`)
                        fetch(`${process.env.REACT_APP_API_URL}/speciesInfo/pokedex/${id}/versionGroup/${versionGroupId}/language/${languageId}`)
                            .then(response => response.json())
                            .then((newSpeciesInfo: PokemonSpeciesInfo[]) => {
                                console.log(`Team builder: got ${newSpeciesInfo.length} species info for pokedex ${id}`)

                                let sortedSpeciesInfo = newSpeciesInfo.sort((a, b) => getPokedexNumberOfSpecies(a, id)! - getPokedexNumberOfSpecies(b, id)!)

                                let speciesInfoDict = speciesInfo.speciesInfo

                                speciesInfoDict.push({
                                    pokedexId: id,
                                    speciesInfo: sortedSpeciesInfo,
                                })

                                setSpeciesInfo(new SpeciesInfo(speciesInfoDict))
                            })
                            .catch(error => console.error(error))
                    }
                )
            )
            .finally(() => setLoadingSpeciesInfo(false))
        }

        fetchBaseStats(versionGroupId)
        fetchSpeciesInfo(versionGroupId)

        return () => {
            setBaseStats([])
            setSpeciesInfo(new SpeciesInfo([]))
        }
    }, [versionGroupId, versionGroups])

    const renderMenu = () => {
        if (pageIsLoading) {
            return null
        }

        return (
            <div className="flex">
                <div className="margin-right">
                    <VersionGroupSelector
                        versionGroups={versionGroups}
                        setVersionGroupId={setVersionGroupId}
                        versionGroupId={versionGroupId} />
                </div>
                <div className="margin-right">
                    {toggleSet}
                </div>
                <div>

                </div>
            </div>
        )
    }

    const toggleHideTooltips = () => setHideTooltips(!hideTooltips)

    // returns the set of toggles for the menu
    const toggleSet = (
        <div>
            <Form className="margin-bottom">
                <Form.Field>
                    <Checkbox
                        id="hideTooltipsCheckbox"
                        checked={hideTooltips}
                        label="Hide tooltips"
                        onChange={toggleHideTooltips} />
                </Form.Field>
            </Form>
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
                    hideTooltips={hideTooltips}
                    speciesInfo={speciesInfo}
                    loadingSpeciesInfo={loadingSpeciesInfo}
                    generations={generations}
                    types={types}
                    baseStats={baseStats.filter(s => !s.isBattleOnly)} />
            )

            if (i < TEAM_SIZE - 1) {
                items.push(<hr></hr>)
            }
        }

        return <div>{items}</div>
    }

    const versionGroup = versionGroups.find(g => g.versionGroupId === versionGroupId)

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
