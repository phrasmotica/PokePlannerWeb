import { ISelectorBaseProps, ISelectorBaseState, SelectorBase, Option } from "./SelectorBase"

import { getDisplayName, hasDisplayNames, hasValidity, isValid } from "../../models/Helpers"

import {
    PokemonEntry,
    PokemonFormEntry,
    PokemonSpeciesEntry
} from "../../models/swagger"

import { WithId } from "../../models/WithId"

import { CookieHelper } from "../../util/CookieHelper"

interface IVarietySelectorProps extends ISelectorBaseProps<PokemonEntry> {
    /**
     * The species of the selected variety.
     */
    species: PokemonSpeciesEntry | undefined

    /**
     * List of objects mapping variety IDs to the variety's forms.
     */
    formsDict: WithId<PokemonFormEntry[]>[]

    /**
     * The ID of the selected form.
     */
    formId: number | undefined

    /**
     * Handler for setting the variety in the parent component.
     */
    setVariety: (variety: PokemonEntry) => void

    /**
     * Handler for setting the form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * Whether the variety should be marked as invalid.
     */
    shouldMarkInvalid: boolean
}

interface IVarietySelectorState extends ISelectorBaseState {

}

/**
 * Component for selecting a species variety.
 */
export class VarietySelector
    extends SelectorBase<PokemonEntry, IVarietySelectorProps, IVarietySelectorState> {
    /**
     * Initialises the component's state.
     */
    initState(): IVarietySelectorState {
        return {
            validityTooltipOpen: false,
            filterOpen: false
        }
    }

    /**
     * Returns options for the variety select.
     */
    createOptions(): Option[] {
        let species = this.props.species
        if (species === undefined) {
            return []
        }

        if (this.props.formId === undefined) {
            return []
        }

        let varietyId = this.props.entryId
        if (varietyId === undefined) {
            return []
        }

        if (this.isDisabled()) {
            return []
        }

        return this.props.entries.map(variety => {
            let label = getDisplayName(species!, "en") ?? "-"

            if (hasDisplayNames(variety)) {
                label = getDisplayName(variety, "en") ?? label
            }

            return {
                label: label,
                value: variety.pokemonId
            }
        })
    }

    /**
     * Returns a string describing the type of entry being displayed.
     */
    getEntryType(): string {
        return "variety"
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
        return "Select a variety!"
    }

    /**
     * Handler for when the selected variety changes.
     */
    onChange(option: any): void {
        let varietyId = option.value

        // set variety cookie and remove old form cookie
        CookieHelper.set(`varietyId${this.props.index}`, varietyId)
        CookieHelper.remove(`formId${this.props.index}`)

        let variety = this.getEntry(varietyId)
        this.props.setVariety(variety)

        // set first form
        let forms = this.getFormsOfVariety(varietyId)
        let form = forms[0]

        // set form cookie
        CookieHelper.set(`formId${this.props.index}`, form.pokemonFormId)

        this.props.setForm(form)
    }

    /**
     * Returns whether the variety is valid in the selected version group.
     */
    entryIsValid(): boolean {
        if (this.props.species === undefined) {
            return true
        }

        if (this.props.formId === undefined) {
            return true
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(
                `Variety selector ${this.props.index}: version group ID is undefined!`
            )
        }

        let pokemonIsValid = isValid(this.props.species, versionGroupId)

        let form = this.getSelectedForm()
        if (form !== undefined && hasValidity(form)) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && isValid(form, versionGroupId)
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
     * Returns a message indicating the variety ID is undefined.
     */
    getEntryIdUndefinedMessage(): string {
        return `Variety selector ${this.props.index}: variety ID is undefined!`
    }

    /**
     * Returns whether the given variety has the given ID.
     */
    entryMatches(entry: PokemonEntry, id: number): boolean {
        return entry.pokemonId === id
    }

    /**
     * Returns a message indicating the variety with the given ID is missing.
     */
    getEntryMissingMessage(id: number): string {
        return `Variety selector ${this.props.index}: no variety found with ID ${id}!`
    }

    /**
     * Returns the data object for the selected Pokemon form.
     */
    getSelectedForm() {
        let selectedFormId = this.props.formId
        if (selectedFormId === undefined) {
            return undefined
        }

        return this.getForm(selectedFormId)
    }

    /**
     * Returns the data object for the Pokemon form with the given ID.
     */
    getForm(formId: number) {
        let allForms = this.getFormsOfSelectedVariety()

        let form = allForms.find(f => f.pokemonFormId === formId)
        if (form === undefined) {
            return undefined
        }

        return form
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfVariety(varietyId: number) {
        // TODO: remove formsDict and formId from this component's props
        let formsDict = this.props.formsDict
        if (formsDict.length <= 0) {
            return []
        }

        let forms = formsDict.find(e => e.id === varietyId)
        if (forms === undefined) {
            return []
        }

        return forms.data
    }

    /**
     * Returns the forms of the selected variety.
     */
    getFormsOfSelectedVariety() {
        let varietyId = this.props.entryId
        if (varietyId === undefined) {
            return []
        }

        return this.getFormsOfVariety(varietyId)
    }
}