import React, { useEffect, useState } from "react"
import { Form, List } from "semantic-ui-react"

import { EncounterCard } from "../EncounterCard/EncounterCard"
import { LocationAreaSelector } from "../LocationAreaSelector/LocationAreaSelector"
import { LocationSelector } from "../LocationSelector/LocationSelector"
import { VersionGroupSelector } from "../VersionGroupSelector/VersionGroupSelector"

import { groupBy } from "../../models/Helpers"
import { EncountersInfo, LocationInfo, VersionGroupInfo } from "../../models/swagger"

import "./AreaChecker.css"

interface AreaCheckerProps {

}

export const AreaChecker = (props: AreaCheckerProps) => {
    const [versionGroups, setVersionGroups] = useState<VersionGroupInfo[]>([])
    const [loadingVersionGroups, setLoadingVersionGroups] = useState(false)
    const [versionGroupId, setVersionGroupId] = useState<number>()

    const [locations, setLocations] = useState<LocationInfo[]>([])
    const [loadingLocations, setLoadingLocations] = useState(false)
    const [locationId, setLocationId] = useState<number>()
    const [locationAreaId, setLocationAreaId] = useState<number>()

    const [encounters, setEncounters] = useState<EncountersInfo[]>([])
    const [loadingEncounters, setLoadingEncounters] = useState(false)

    useEffect(() => {
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

        fetchVersionGroups()

        return () => {
            setVersionGroups([])
            setVersionGroupId(undefined)
            setLoadingVersionGroups(false)
        }
    }, [])

    useEffect(() => {
        const fetchLocations = () => {
            let versionGroup = versionGroups.find(v => v.versionGroupId === versionGroupId)
            let regions = versionGroup?.versionGroupRegions ?? []
            if (regions.length <= 0) {
                return
            }

            setLoadingLocations(true)

            Promise.all(
                regions.map(r => {
                    let regionId = r.region!.id
                    let languageId = 9

                    fetch(`${process.env.REACT_APP_API_URL}/locationInfo/region/${regionId}/language/${languageId}`)
                        .then(response => response.json())
                        .then((newLocations: LocationInfo[]) => {
                            let totalLocations = [...locations, ...newLocations]
                            setLocations(totalLocations)
                            setLocationId(totalLocations[0].id)
                        })
                        .catch(error => console.error(error))
                })
            )
            .then(() => setLoadingLocations(false))
        }

        fetchLocations()

        return () => {
            setLocations([])
            setLocationId(undefined)
            setLoadingLocations(false)
        }
    }, [versionGroupId])

    useEffect(() => {
        let selectedLocation = locations.find(l => l.id === locationId)
        let areas = selectedLocation?.locationAreas ?? []
        if (areas.length > 0) {
            setLocationAreaId(areas[0].id)
        }

        return () => setLocationAreaId(undefined)
    }, [locationId])

    useEffect(() => {
        const fetchEncounters = () => {
            let versionGroup = versionGroups.find(v => v.versionGroupId === versionGroupId)
            let versions = versionGroup?.versionInfo ?? []
            if (versions.length <= 0) {
                return
            }

            setLoadingEncounters(true)

            let languageId = 9

            Promise.all(
                versions.map(v => {
                    let versionId = v.versionId

                    fetch(`${process.env.REACT_APP_API_URL}/encountersInfo/locationArea/${locationAreaId}/version/${versionId}/language/${languageId}`)
                        .then(response => response.json())
                        .then((newEncounters: EncountersInfo[]) => {
                            let totalEncounters = [...encounters, ...newEncounters]
                            setEncounters(totalEncounters)
                        })
                        .catch(error => console.error(error))
                })
            )
            .then(() => setLoadingEncounters(false))
        }

        fetchEncounters()

        return() => setEncounters([])
    }, [locationAreaId, setEncounters])

    const renderMenu = () => {
        let selectedLocation = locations.find(l => l.id === locationId)

        return (
            <div className="area-checker-menu">
                <Form className="margin-bottom">
                    <VersionGroupSelector
                        versionGroups={versionGroups}
                        setVersionGroupId={setVersionGroupId}
                        versionGroupId={versionGroupId} />

                    <LocationSelector
                        locations={locations}
                        setLocationId={setLocationId}
                        locationId={locationId} />

                    <LocationAreaSelector
                        location={selectedLocation}
                        setLocationAreaId={setLocationAreaId}
                        locationAreaId={locationAreaId} />
                </Form>
            </div>
        )
    }

    const renderEncounters = () => {
        if (loadingEncounters) {
            return (
                <div className="area-checker-encounters">
                    <p>Loading encounters...</p>
                </div>
            )
        }

        // TODO: group encounters by method, then by pokemon
        let groupedEncounters = groupBy(encounters, e => e.pokemonId)

        let pokemonIds = Object.keys(groupedEncounters).map(k => Number(k))

        return (
            <div className="area-checker-encounters">
                <List divided>
                    {pokemonIds.map(id => (
                        <EncounterCard
                            pokemonId={id}
                            encounters={groupedEncounters[id]} />
                    ))}
                </List>
            </div>
        )
    }

    return (
        <div>
            <p>Check what can be found in an area!</p>

            <div className="flex">
                {renderMenu()}
                {renderEncounters()}
            </div>
        </div>
    )
}
