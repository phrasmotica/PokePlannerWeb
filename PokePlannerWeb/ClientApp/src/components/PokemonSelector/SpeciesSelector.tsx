import React from "react"
import { Button, Tooltip } from "reactstrap"
import { FaFilter } from "react-icons/fa"

import { PokemonSpeciesFilter } from "./Filter"
import { ISelectorBaseProps, ISelectorBaseState, SelectorBase, Option } from "./SelectorBase"

import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { CookieHelper } from "../../util/CookieHelper"

interface ISpeciesSelectorProps extends ISelectorBaseProps<PokemonSpeciesEntry> {
    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number | undefined) => void
}

interface ISpeciesSelectorState extends ISelectorBaseState {
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
export class SpeciesSelector
    extends SelectorBase<PokemonSpeciesEntry, ISpeciesSelectorProps, ISpeciesSelectorState> {
    /**
     * Initialises the component's state.
     */
    initState(): ISpeciesSelectorState {
        return {
            speciesFilterIds: [],
            speciesFilterOpen: false,
            validityTooltipOpen: false
        }
    }

    /**
     * Renders the filter button.
     */
    renderFilterButton(): any {
        let index = this.props.index
        let buttonId = `selector${index}speciesFilterButton`

        return (
            <Button
                id={buttonId}
                color="primary"
                className="filter-button"
                onMouseUp={() => {this.toggleSpeciesFilter()}}>
                <FaFilter className="selector-button-icon" />
            </Button>
        )
    }

    /**
     * Renders the filter.
     */
    renderFilter(): any {
        let index = this.props.index
        let buttonId = `selector${index}speciesFilterButton`

        let species = this.props.entries
        let speciesIds = species.map(s => s.speciesId)
        let filteredSpeciesIds = species.filter(s => this.isPresent(s)).map(s => s.speciesId)
        let speciesLabels = species.map(s => s.getDisplayName("en") ?? "-")

        return (
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
                    setFilterIds={(filterIds: number[]) => this.setSpeciesFilterIds(filterIds)} />
            </Tooltip>
        )
    }

    /**
     * Returns options for the species select.
     */
    createOptions(): Option[] {
        return this.getFilteredSpecies().map(species => ({
            label: species.getDisplayName("en") ?? "-",
            value: species.speciesId
        }))
    }

    /**
     * Returns a string describing the type of entry being displayed.
     */
    getEntryType(): string {
        return "species"
    }

    /**
     * Returns whether the select box should be disabled.
     */
    isDisabled(): boolean {
        return false
    }

    /**
     * Returns the placeholder for the select box.
     */
    getPlaceholder(): string {
        return "Select a species!"
    }

    /**
     * Handler for when the selected species changes.
     */
    onChange(option: any): void {
        let speciesId = option.value

        // set cookie
        CookieHelper.set(`speciesId${this.props.index}`, speciesId)

        this.props.setSpecies(speciesId)
    }

    /**
     * Returns the species that match the species filter.
     */
    getFilteredSpecies() {
        return this.props.entries.filter(s => this.isPresent(s))
    }

    /**
     * Returns whether the species passes the filter.
     */
    isPresent(species: PokemonSpeciesEntry) {
        let filters = this.state.speciesFilterIds
        return filters.length <= 0 || filters.includes(species.speciesId)
    }

    /**
     * Returns whether the species is valid in the selected version group.
     */
    entryIsValid(): boolean {
        if (this.props.entryId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${this.props.index}: version group ID is undefined!`
            )
        }

        return this.getSelectedEntry().isValid(versionGroupId)
    }

    /**
     * Returns a message indicating the species ID is undefined.
     */
    getEntryIdUndefinedMessage(): string {
        return `Species selector ${this.props.index}: species ID is undefined!`
    }

    /**
     * Returns whether the given species has the given ID.
     */
    entryMatches(entry: PokemonSpeciesEntry, id: number): boolean {
        return entry.speciesId === id
    }

    /**
     * Returns a message indicating the species with the given ID is missing.
     */
    getEntryMissingMessage(id: number): string {
        return `Species selector ${this.props.index}: no species found with ID ${id}!`
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

        // no longer have a valid species
        let speciesId = this.props.entryId
        if (speciesId !== undefined && !filterIds.includes(speciesId)) {
            this.props.setSpecies(undefined)
        }
    }
}