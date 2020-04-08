import React, { Component } from "react"
import { Tooltip } from "reactstrap"
import Select from "react-select"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

export interface ISelectorBaseProps<TEntry> extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * List of entries to select from.
     */
    entries: TEntry[]

    /**
     * The ID of the selected entry.
     */
    entryId: number | undefined

    /**
     * Whether the parent component is loading data to be passed to this component.
     */
    loading: boolean

    /**
     * Whether the entry should be marked as invalid.
     */
    shouldMarkInvalid: boolean
}

export interface ISelectorBaseState {
    /**
     * Whether the validity tooltip is open.
     */
    validityTooltipOpen: boolean

    /**
     * Whether the filter is open.
     */
    filterOpen: boolean
}

/**
 * Component for selecting an entry from a list that may be determined invalid.
 */
export abstract class SelectorBase<TEntry, TProps extends ISelectorBaseProps<TEntry>, TState extends ISelectorBaseState>
    extends Component<TProps, TState> {
    /**
     * Constructor.
     */
    constructor(props: TProps) {
        super(props)
        this.state = this.initState()
    }

    /**
     * Initialises the component's state.
     */
    abstract initState(): TState

    /**
     * Renders the component.
     */
    render() {
        return this.renderEntrySelect()
    }

    /**
     * Renders the entry select.
     */
    renderEntrySelect() {
        let options = this.createOptions()

        let selectedOption = null
        let entryId = (this.props as TProps).entryId
        if (entryId !== undefined) {
            selectedOption = options.find(o => o.value === entryId)
        }

        // attach red border if necessary
        let customStyles = this.createSelectStyles()

        let isDisabled = this.isDisabled()
        let selectId = this.getEntryType() + "Select" + (this.props as TProps).index
        let searchBox = (
            <Select
                isSearchable
                blurInputOnSelect
                width="230px"
                isLoading={this.props.loading}
                isDisabled={isDisabled}
                className="margin-right-small"
                id={selectId}
                styles={customStyles}
                placeholder={isDisabled ? "-" : this.getPlaceholder()}
                onChange={(option: any) => this.onChange(option)}
                value={selectedOption}
                options={options} />
        )

        // attach validity tooltip if necessary
        let validityTooltip = this.renderValidityTooltip(selectId)

        let filterButton = this.renderFilterButton()
        if (this.state.filterOpen) {
            searchBox = this.renderFilter()
        }

        return (
            <div className="flex-space-between margin-bottom-small">
                {searchBox}
                {validityTooltip}
                {filterButton}
            </div>
        )
    }

    /**
     * Returns options for the select box.
     */
    abstract createOptions(): Option[]

    /**
     * Returns a custom style for the select box.
     */
    createSelectStyles() {
        let shouldMarkInvalid = (this.props as TProps).shouldMarkInvalid

        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width,
                border: shouldMarkInvalid && !this.entryIsValid() ? "1px solid #dc3545" : ""
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }

    /**
     * Returns a string describing the type of entry being displayed.
     */
    abstract getEntryType(): string

    /**
     * Returns whether the select box should be disabled.
     */
    abstract isDisabled(): boolean

    /**
     * Returns the placeholder for the select box.
     */
    abstract getPlaceholder(): string

    /**
     * Handler for when the selected entry changes.
     */
    abstract onChange(option: any): void

    /**
     * Returns whether the entry is valid.
     */
    abstract entryIsValid(): boolean

    /**
     * Renders a tooltip indicating the validity of the entry.
     */
    renderValidityTooltip(targetId: string) {
        let props = this.props as TProps
        let shouldRender = !props.hideTooltips
                        && props.shouldMarkInvalid
                        && !this.entryIsValid()

        if (shouldRender) {
            return (
                <Tooltip
                    isOpen={this.state.validityTooltipOpen}
                    toggle={() => this.toggleValidityTooltip()}
                    placement="bottom"
                    target={targetId}>
                    Cannot be obtained in this game version!
                </Tooltip>
            )
        }

        return null
    }

    /**
     * Renders the filter button.
     */
    abstract renderFilterButton(): any

    /**
     * Renders the filter.
     */
    abstract renderFilter(): any

    /**
     * Returns the selected entry.
     */
    getSelectedEntry() {
        let entryId = (this.props as TProps).entryId
        if (entryId === undefined) {
            throw new Error(this.getEntryIdUndefinedMessage())
        }

        return this.getEntry(entryId)
    }

    /**
     * Returns a message indicating the entry ID is undefined.
     */
    abstract getEntryIdUndefinedMessage(): string

    /**
     * Returns the entry matching the given ID.
     */
    getEntry(id: number) {
        let allEntries = (this.props as TProps).entries

        let entry = allEntries.find(e => this.entryMatches(e, id))
        if (entry === undefined) {
            throw new Error(this.getEntryMissingMessage(id))
        }

        return entry
    }

    /**
     * Returns whether the given entry matches the given ID.
     */
    abstract entryMatches(entry: TEntry, id: number): boolean

    /**
     * Returns a message indicating the entry with the given ID is missing.
     */
    abstract getEntryMissingMessage(id: number): string

    /**
     * Toggles the validity tooltip.
     */
    toggleValidityTooltip() {
        this.setState(previousState => ({
            validityTooltipOpen: !previousState.validityTooltipOpen
        }))
    }
}

/**
 * Interface for react-select options.
 */
export interface Option {
    /**
     * The label of the option.
     */
    label: string

    /**
     * The value of the option.
     */
    value: number
}