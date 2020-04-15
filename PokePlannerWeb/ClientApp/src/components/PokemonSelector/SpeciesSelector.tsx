import React from "react"
import { Button } from "reactstrap"
import { FaFilter } from "react-icons/fa"

import { Filter } from "./Filter"
import { ISelectorBaseProps, ISelectorBaseState, SelectorBase, Option } from "./SelectorBase"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { CookieHelper } from "../../util/CookieHelper"

interface ISpeciesSelectorProps extends ISelectorBaseProps<PokemonSpeciesEntry> {
    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number | undefined) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleFilter: () => void
}

interface ISpeciesSelectorState extends ISelectorBaseState {
    /**
     * The IDs of the generations to filter species for.
     */
    generationFilterIds: number[]
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
            generationFilterIds: [],
            filterOpen: false,
            validityTooltipOpen: false
        }
    }

    /**
     * Renders the filter button.
     */
    renderFilterButton(): any {
        let filterOpen = this.state.filterOpen

        return (
            <span title="Filter by generation">
                <Button
                    color={filterOpen ? "success" : "secondary"}
                    className="filter-button"
                    onMouseUp={() => {this.toggleFilter()}}>
                    <FaFilter className="selector-button-icon" />
                </Button>
            </span>
        )
    }

    /**
     * Renders the filter.
     */
    renderFilter(): any {
        let species = this.props.entries
        let generationIds = species.map(s => s.generation.id)
                                   .distinct()

        let filteredGenerationIds = species.filter(s => this.isPresent(s))
                                           .map(s => s.generation.id)
                                           .distinct()

        let generations = this.props.generations
        let generationLabels = generations.filter(g => generationIds.includes(g.generationId))
                                          .map(g => g.getShortDisplayName("en") ?? "-")

        return (
            <Filter
                index={this.props.index}
                allIds={generationIds}
                allLabels={generationLabels}
                filteredIds={filteredGenerationIds}
                placeholder="Filter by generation"
                setFilterIds={(filterIds: number[]) => this.setGenerationFilterIds(filterIds)} />
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
        let filters = this.state.generationFilterIds
        return filters.length <= 0 || filters.includes(species.generation.id)
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
    toggleFilter() {
        this.setState(previousState => ({
            filterOpen: !previousState.filterOpen
        }))

        this.props.toggleFilter()
    }

    /**
     * Sets the species ID filter.
     */
    setGenerationFilterIds(filterIds: number[]) {
        this.setState({ generationFilterIds: filterIds })

        // no longer have a valid species
        let speciesId = this.props.entryId
        if (speciesId !== undefined) {
            let species = this.getSelectedEntry()
            if (!filterIds.includes(species.generation.id)) {
                this.props.setSpecies(undefined)
            }
        }
    }
}