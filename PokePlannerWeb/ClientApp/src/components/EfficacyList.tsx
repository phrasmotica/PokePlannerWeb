import { Component } from "react";
import React from "react";
import { Spinner, Table } from "reactstrap";

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
    concreteTypes: string[],

    /**
     * Whether we're loading the concrete type names.
     */
    loadingConcreteTypes: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            efficacy: [],
            loadingEfficacy: true,
            concreteTypes: [],
            loadingConcreteTypes: true
        }

        // bind stuff to this object
        this.handleEfficacyResponse = this.handleEfficacyResponse.bind(this)
    }

    componentDidMount() {
        // get efficacy
        this.getEfficacy()

        // get list of concrete types
        this.getConcreteTypeNames()

        // finished loading
        this.setState({
            loadingEfficacy: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh efficacy and concrete type names if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        if (versionGroupIndex !== previousVersionGroupIndex) {
            this.getEfficacy()
            this.getConcreteTypeNames()
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

        let types = this.state.concreteTypes
        let efficacy = this.state.efficacy
        return (
            <Table>
                <tbody>
                    <tr key={this.props.index}>
                        {types.map((type, index) => {
                            return (
                                <td key={index}>
                                    <em>{type}</em> <b>{efficacy[index]}x</b>
                                </td>
                            )
                        })}
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

    // retrieves the names of the concrete types from TypeController
    getConcreteTypeNames() {
        console.log(`Efficacy list ${this.props.index}: getting concrete type names...`)

        // loading begins
        this.setState({
            loadingConcreteTypes: true
        })

        // get concrete type names
        fetch(`type/concrete/${this.props.versionGroupIndex}`)
            .then(response => {
                if (response.status === 200) {
                    return response
                }

                // concrete types endpoint couldn't be found
                throw new Error(`Efficacy list ${this.props.index}: couldn't get concrete type names!`)
            })
            .then(response => response.json())
            .then(concreteTypes => this.setState({ concreteTypes: concreteTypes }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingConcreteTypes: false }))
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