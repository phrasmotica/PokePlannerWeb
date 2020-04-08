import React, { Component } from "react"
import Select from "react-select"

import { IHasIndex } from "../CommonMembers"

import "./Filter.scss"

interface IFilterProps extends IHasIndex {
    /**
     * The IDs of the items to filter.
     */
    allIds: number[]

    /**
     * The labels of the items to filter.
     */
    allLabels: string[]

    /**
     * The IDs of the items that pass the filter.
     */
    filteredIds: number[]

    /**
     * The placeholder text for the select boxc.
     */
    placeholder: string

    /**
     * Handler for setting the filter in the parent component.
     */
    setFilterIds: (filterIds: number[]) => void
}

interface IFilterState {

}

/**
 * Component for filtering a list of entries stored in the parent component.
 */
export class Filter extends Component<IFilterProps, IFilterState> {
    render() {
        return this.renderFilter()
    }

    /**
     * Renders the filter.
     */
    renderFilter() {
        let options = this.createFilterOptions()
        let defaultOptions = options.filter((o: any) => this.props.filteredIds.includes(o.value))

        const onChange = (options: any) => {
            let values = []
            if (options !== null) {
                values = options.map((o: any) => o.value)
            }

            this.props.setFilterIds(values)
        }

        return (
            <Select
                isMulti
                hideSelectedOptions
                isClearable={false}
                width="230px"
                styles={this.createSelectStyles()}
                className="margin-right-small"
                closeMenuOnSelect={false}
                placeholder={this.props.placeholder}
                defaultValue={defaultOptions}
                options={options}
                onChange={onChange} />
        )
    }

    /**
     * Returns options for the filter.
     */
    createFilterOptions() {
        return this.props.allIds.map((id, index) => {
            return {
                label: this.props.allLabels[index],
                value: id
            }
        })
    }

    /**
     * Returns a custom style for the select box.
     */
    createSelectStyles() {
        return {
            container: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            }),

            control: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            }),

            menu: (provided: any, state: any) => ({
                ...provided,
                minWidth: state.selectProps.width
            })
        }
    }
}