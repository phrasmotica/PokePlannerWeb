import { Component } from "react";
import React from "react";
import { Spinner } from "reactstrap";

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
     * The index of the selected version group.
     */
    loading: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            efficacy: [],
            loading: true
        }

        // bind stuff to this object
        this.handleResponse = this.handleResponse.bind(this)
    }

    componentDidMount() {
        // get efficacy
        this.getEfficacy()

        // finished loading
        this.setState({
            loading: false
        })
    }

    componentDidUpdate(previousProps: any) {
        // refresh efficacy if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        if (versionGroupIndex !== previousVersionGroupIndex) {
            this.getEfficacy()
        }
    }

    render() {
        return this.renderTypeEfficacy()
    }

    renderTypeEfficacy() {
        // display message if we're loading
        if (this.state.loading) {
            return this.makeSpinner()
        }

        return (
            <table className='table table-striped' aria-labelledby="tableLabel">
                <tbody>
                    <tr key={this.props.index}>
                        {this.state.efficacy.map((value, index) => {
                            return (
                                <td key={index}>
                                    <em>{index}</em>: <b>{value}x</b>
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
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
                loading: true
            })

            // get efficacy data
            fetch(`efficacy/${species}/${this.props.versionGroupIndex}`)
                .then(this.handleResponse)
                .then(response => response.json())
                .then(efficacy => this.setState({ efficacy: efficacy }))
                .catch(error => console.log(error))
                .then(() => this.setState({ loading: false }))
        }
    }

    // handle PokeAPI responses
    handleResponse(response: Response) {
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