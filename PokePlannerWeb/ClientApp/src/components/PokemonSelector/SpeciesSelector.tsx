import React, { Component } from "react"
import { Button, Tooltip } from "reactstrap"
import { FaFilter } from "react-icons/fa"
import Select from "react-select"

import { PokemonSpeciesFilter } from "./Filter"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { CookieHelper } from "../../util/CookieHelper"

interface ISpeciesSelectorProps extends IHasIndex, IHasVersionGroup {
    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * The ID of the selected species.
     */
    speciesId: number | undefined

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number) => void

    /**
     * Whether the species should be marked as invalid.
     */
    shouldMarkInvalid: boolean
}

interface ISpeciesSelectorState {
    /**
     * The IDs of the generations to filter species for.
     */
    speciesFilterIds: number[]

    /**
     * Whether the species filter is open.
     */
    speciesFilterOpen: boolean
}

/**
 * Component for selecting a Pokemon species.
 */
export class SpeciesSelector extends Component<ISpeciesSelectorProps, ISpeciesSelectorState> {
    constructor(props: ISpeciesSelectorProps) {
        super(props)
        this.state = {
            speciesFilterIds: [],
            speciesFilterOpen: false
        }
    }

    /**
     * Renders the component.
     */
    render() {
        return this.renderSpeciesSelect()
    }

    /**
     * Renders the species select.
     */
    renderSpeciesSelect() {
        let options = this.createOptions()

        let selectedOption = null
        let speciesId = this.props.speciesId
        if (speciesId !== undefined) {
            selectedOption = options.find(o => o.value === speciesId)
        }

        const onChange = (option: any) => {
            let speciesId = option.value

            // set cookie
            CookieHelper.set(`speciesId${this.props.index}`, speciesId)

            this.props.setSpecies(speciesId)
        }

        // attach validity tooltip and red border if necessary
        let customStyles = this.createSelectStyles()

        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                className="margin-right-small"
                id={"speciesSelect" + this.props.index}
                styles={customStyles}
                placeholder="Select a species!"
                onChange={onChange}
                value={selectedOption}
                options={options} />
        )

        let index = this.props.index
        let buttonId = `selector${index}speciesFilterButton`
        let filterButton = (
            <Button
                id={buttonId}
                color="primary"
                className="filter-button"
                onMouseUp={() => {this.toggleSpeciesFilter()}}>
                <FaFilter className="selector-button-icon" />
            </Button>
        )

        let species = this.props.species
        let speciesIds = species.map(s => s.speciesId)
        let filteredSpeciesIds = species.filter(s => this.isPresent(s)).map(s => s.speciesId)
        let speciesLabels = species.map(s => s.getDisplayName("en") ?? "-")
        let speciesPresenceList = species.map(s => this.isPresent(s))

        let filter = (
            <Tooltip
                className="filter-tooltip"
                placement="bottom"
                isOpen={this.state.speciesFilterOpen}
                target={buttonId}>
                <PokemonSpeciesFilter
                    index={this.props.index}
                    allIds={speciesIds}
                    filterIds={filteredSpeciesIds}
                    filterLabels={speciesLabels}
                    isPresent={speciesPresenceList}
                    setFilterIds={(filterIds: number[]) => this.setSpeciesFilterIds(filterIds)} />
            </Tooltip>
        )

        return (
            <div className="flex-space-between margin-bottom-small">
                {searchBox}
                {filterButton}
                {filter}
            </div>
        )
    }

    /**
     * Returns options for the species select.
     */
    createOptions() {
        return this.getFilteredSpecies().map(species => ({
            label: species.getDisplayName("en"),
            value: species.speciesId
        }))
    }

    /**
     * Returns the species that match the species filter.
     */
    getFilteredSpecies() {
        return this.props.species.filter(s => this.isPresent(s))
    }

    /**
     * Returns whether the species passes the filter.
     */
    isPresent(species: PokemonSpeciesEntry) {
        let filters = this.state.speciesFilterIds
        return filters.length <= 0 || filters.includes(species.speciesId)
    }

    // returns a custom style for the select boxes
    createSelectStyles() {
        let shouldMarkInvalid = this.props.shouldMarkInvalid

        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                marginLeft: "auto"
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                border: shouldMarkInvalid && !this.speciesIsValid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    /**
     * Returns whether the species is valid in the selected version group.
     */
    speciesIsValid() {
        if (this.props.speciesId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${this.props.index}: version group ID is undefined!`
            )
        }

        return this.getSelectedSpecies().isValid(versionGroupId)
    }

    /**
     * Returns the data object for the selected species.
     */
    getSelectedSpecies() {
        let speciesId = this.props.speciesId
        if (speciesId === undefined) {
            throw new Error(
                `Selector ${this.props.index}: species ID is undefined!`
            )
        }

        return this.getSpecies(speciesId)
    }

    /**
     * Returns the data object for the species with the given ID.
     */
    getSpecies(speciesId: number) {
        let allSpecies = this.props.species

        let species = allSpecies.find(s => s.speciesId === speciesId)
        if (species === undefined) {
            throw new Error(
                `Species selector ${this.props.index}: no species found with ID ${speciesId}!`
            )
        }

        return species
    }

    /**
     * Toggles the species filter.
     */
    toggleSpeciesFilter() {
        this.setState(previousState => ({
            speciesFilterOpen: !previousState.speciesFilterOpen
        }))
    }

    /**
     * Sets the species ID filter.
     */
    setSpeciesFilterIds(filterIds: number[]) {
        this.setState({ speciesFilterIds: filterIds })
    }
}