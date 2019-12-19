﻿import { Component } from "react";
import React from "react";
import { Spinner, Table } from "reactstrap";
import { TypeSet } from "../models/TypeSet";

export class EfficacyList extends Component<{
    /**
     * The index of this efficacy list.
     */
    index: number,

    /**
     * The Pokemon to show efficacy for.
     */
    species: string,

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number
}, {
    /**
     * The efficacy to show.
     */
    efficacy: number[],

    /**
     * Whether we're loading the efficacy.
     */
    loadingEfficacy: boolean,

    /**
     * The list of concrete type names.
     */
    typeSet: TypeSet,

    /**
     * Whether we're loading the concrete type names.
     */
    loadingTypeSet: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            efficacy: [],
            loadingEfficacy: true,
            typeSet: {
                versionGroupId: this.props.versionGroupIndex,
                types: [],
                typesArePresent: []
            },
            loadingTypeSet: true
        }

        // bind stuff to this object
        this.handleEfficacyResponse = this.handleEfficacyResponse.bind(this)
    }

    componentDidMount() {
        // get efficacy
        this.getEfficacy()

        // get type set
        this.getTypeSet()

        // finished loading
        this.setState({
            loadingEfficacy: false,
            loadingTypeSet: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh efficacy and concrete type names if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        if (versionGroupIndex !== previousVersionGroupIndex) {
            this.getEfficacy()
            this.getTypeSet()
        }
    }

    render() {
        return this.renderTypeEfficacy()
    }

    renderTypeEfficacy() {
        // display message if we're loading
        if (this.state.loadingEfficacy) {
            return this.makeSpinner()
        }

        // only display types that are present
        let typeSet = this.state.typeSet
        let efficacy = this.state.efficacy
        let items = []
        for (let i = 0; i < typeSet.types.length; i++) {
            if (typeSet.typesArePresent[i]) {
                items.push(
                    <td key={i}>
                        <em>{typeSet.types[i]}</em> <b>{efficacy[i]}x</b>
                    </td>
                )
            }
            else {
                items.push(
                    <td key={i}>
                        <em>{typeSet.types[i]}</em> <b>N/A</b>
                    </td>
                )
            }
        }

        return (
            <Table>
                <tbody>
                    <tr key={this.props.index}>
                        {items}
                    </tr>
                </tbody>
            </Table>
        )
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // retrieves the Pokemon's efficacy from EfficacyController
    getEfficacy() {
        let species = this.props.species
        if (species && species !== "") {
            console.log(`Efficacy list ${this.props.index}: getting efficacy for '${species}'...`)

            // loading begins
            this.setState({
                loadingEfficacy: true
            })

            // get efficacy data
            fetch(`efficacy/${species}/${this.props.versionGroupIndex}`)
                .then(this.handleEfficacyResponse)
                .then(response => response.json())
                .then(efficacy => this.setState({ efficacy: efficacy }))
                .catch(error => console.log(error))
                .then(() => this.setState({ loadingEfficacy: false }))
        }
    }

    // retrieves the type set from TypeController
    getTypeSet() {
        let index = this.props.versionGroupIndex
        console.log(`Efficacy list ${this.props.index}: getting type set for version group ${index}...`)

        // loading begins
        this.setState({
            loadingTypeSet: true
        })

        // get type set
        fetch(`type/typeSet/${index}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Efficacy list ${this.props.index}: couldn't get type set for version group ${index}!`)
            })
            .then(response => response.json())
            .then(typeSet => this.setState({ typeSet: typeSet }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypeSet: false }))
    }

    // handle PokeAPI responses
    handleEfficacyResponse(response: Response) {
        if (response.status === 200) {
            return response
        }

        let species = this.props.species
        if (response.status === 500) {
            // efficacy endpoint couldn't be found
            throw new Error(`Efficacy list ${this.props.index}: couldn't get efficacy for ${species}'!`)
        }

        // some other error
        throw new Error(`Efficacy list ${this.props.index}: tried to get efficacy for ${species}' but failed with status ${response.status}!`)
    }
}