import React from "react"
import { Button } from "reactstrap"
import { FaFilter } from "react-icons/fa"

import { ISelectorBaseProps, ISelectorBaseState, SelectorBase, Option } from "./SelectorBase"

import { BaseStatFilterModel } from "../SpeciesFilter/BaseStatFilterModel"
import { TypeFilterModel, GenerationFilterModel } from "../SpeciesFilter/IdFilterModel"

import { getBaseStats, getDisplayName, getTypes, isValid } from "../../models/Helpers"

import {
    GenerationEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import { CookieHelper } from "../../util/CookieHelper"

interface ISpeciesSelectorProps extends ISelectorBaseProps<PokemonSpeciesEntry> {
    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * The generation filter.
     */
    generationFilter: GenerationFilterModel

    /**
     * The type filter.
     */
    typeFilter: TypeFilterModel

    /**
     * The base stat filter.
     */
    baseStatFilter: BaseStatFilterModel

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (pokemonSpeciesId: number | undefined) => void

    /**
     * Handler for toggling the species filter in the parent component.
     */
    toggleFilter: () => void
}

interface ISpeciesSelectorState extends ISelectorBaseState {

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
            <span title="Filter species">
                <Button
                    color={filterOpen ? "success" : "info"}
                    className="filter-button"
                    onMouseUp={() => {this.toggleFilter()}}>
                    <FaFilter className="selector-button-icon" />
                </Button>
            </span>
        )
    }

    /**
     * Returns options for the species select.
     */
    createOptions(): Option[] {
        return this.getFilteredSpecies().map(species => ({
            label: getDisplayName(species, "en") ?? "-",
            value: species.pokemonSpeciesId
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
        return this.getFilteredSpecies().length <= 0
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
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Species selector ${this.props.index}: version group ID is undefined!`
            )
        }

        // generation filter test
        let generationId = species.generation.generationId
        let passesGenerationFilter = this.props.generationFilter.passesFilter([generationId])

        // type filter test
        let speciesTypes = getTypes(species, versionGroupId).map(t => t.typeId)
        let passesTypeFilter = this.props.typeFilter.passesFilter(speciesTypes)

        // base stat filter test
        let speciesBaseStats = getBaseStats(species, versionGroupId)
        let passesBaseStatFilter = this.props.baseStatFilter.passesFilter(speciesBaseStats)

        return passesGenerationFilter && passesTypeFilter && passesBaseStatFilter
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

        return isValid(this.getSelectedEntry(), versionGroupId)
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
        return entry.pokemonSpeciesId === id
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
}