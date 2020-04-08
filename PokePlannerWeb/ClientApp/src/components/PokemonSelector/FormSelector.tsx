import { SelectorBase, ISelectorBaseProps, ISelectorBaseState, Option } from "./SelectorBase"

import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { CookieHelper } from "../../util/CookieHelper"

interface IFormSelectorProps extends ISelectorBaseProps<PokemonFormEntry> {
    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * Handler for setting the form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean
}

interface IFormSelectorState extends ISelectorBaseState {

}

/**
 * Component for selecting a Pokemon form.
 */
export class FormSelector
    extends SelectorBase<PokemonFormEntry, IFormSelectorProps, IFormSelectorState> {
    /**
     * Initialises the component's state.
     */
    initState(): IFormSelectorState {
        return {
            validityTooltipOpen: false
        }
    }

    /**
     * Returns options for the select box.
     */
    createOptions(): Option[] {
        if (this.props.entryId === undefined) {
            return []
        }

        let species = this.props.species
        if (species === undefined) {
            return []
        }

        if (this.isDisabled()) {
            return []
        }

        let forms = this.props.entries
        return forms.map(form => {
            // default varieties derive name from their species
            let label = species?.getDisplayName("en") ?? "-"

            if (form.hasDisplayNames()) {
                label = form.getDisplayName("en") ?? label
            }

            return {
                label: label,
                value: form.formId
            }
        })
    }

    /**
     * Returns a string describing the type of entry being displayed.
     */
    getEntryType(): string {
        return "form"
    }

    /**
     * Returns whether the select box should be disabled.
     */
    isDisabled(): boolean {
        return this.props.entries.length <= 1
    }

    /**
     * Returns the placeholder for the select box.
     */
    getPlaceholder(): string {
        return "Select a form!"
    }

    /**
     * Handler for when the selected form changes.
     */
    onChange(option: any): void {
        let formId = option.value

        // set cookie
        CookieHelper.set(`formId${this.props.index}`, formId)

        let form = this.getEntry(formId)
        this.props.setForm(form)
    }

    /**
     * Returns whether the form is valid in the selected version group.
     */
    entryIsValid(): boolean {
        let species = this.props.species
        if (species === undefined) {
            return true
        }

        if (this.props.entryId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Form selector ${this.props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = species.isValid(versionGroupId)

        let form = this.getSelectedEntry()
        if (form !== undefined && form.hasValidity()) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && form.isValid(versionGroupId)
        }

        return pokemonIsValid
    }

    /**
     * Renders the filter button.
     */
    renderFilterButton(): any {
        return null
    }

    /**
     * Renders the filter.
     */
    renderFilter(): any {
        return null
    }

    /**
     * Returns a message indicating the form ID is undefined.
     */
    getEntryIdUndefinedMessage(): string {
        return `Form selector ${this.props.index}: form ID is undefined!`
    }

    /**
     * Returns whether the given form has the given ID.
     */
    entryMatches(entry: PokemonFormEntry, id: number): boolean {
        return entry.formId === id
    }

    /**
     * Returns a message indicating the form with the given ID is missing.
     */
    getEntryMissingMessage(id: number): string {
        return `Form selector ${this.props.index}: no form found with ID ${id}!`
    }
}