import { Component } from "react";
import React from "react";

export class EfficacyList extends Component<{
    /**
     * The index of this efficacy list.
     */
    index: number,

    /**
     * The Pokemon to show efficacy for.
     */
    species: string
}, {
    /**
     * The efficacy to show.
     */
    efficacy: number[],

    /**
     * Whether we're loading the Pokemon's efficacy.
     */
    loading: boolean
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            efficacy: [],
            loading: true
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loading: false
        })

        this.getEfficacy(this.props.species)
    }

    render() {
        return this.renderTypeEfficacy()
    }

    renderTypeEfficacy() {
        // display message if we're loading
        let loadingElement = this.state.loading ? <p><em>Loading...</em></p> : null

        return (
            <table className='table table-striped' aria-labelledby="tableLabel">
                <tbody>
                    <tr>
                        {this.state.efficacy.map((value, index) => {
                            return (
                                <td>
                                    <em>{index}</em>: <b>{value}</b>
                                </td>
                            )
                        })}
                        {loadingElement}
                    </tr>
                </tbody>
            </table>
        )
    }

    // retrieves the Pokemon's efficacy from EfficacyController
    async getEfficacy(species: string) {
        // loading begins
        this.setState({
            loading: true
        })

        // get efficacy data
        console.log(`Efficacy list ${this.props.index}: getting efficacy for '${species}'...`)
        const response = await fetch(`efficacy/${species}`)

        if (response.status === 200) {
            // get JSON payload
            const efficacy = await response.json()
            console.log(`Efficacy list ${this.props.index}: got efficacy for '${species}'`)

            // set new efficacy
            this.setState({
                efficacy: efficacy
            })
        }
        else if (response.status === 500) {
            // efficacy endpoint couldn't be found
            console.log(`Efficacy list ${this.props.index}: couldn't get efficacy for '${species}'!`)
            console.log(`(if '${species}' looks valid, PokeAPI might be down!)`)
            console.log(response)
        }
        else {
            // some other error
            console.log(`Efficacy list ${this.props.index}: tried to get efficacy for '${species}' but failed with status ${response.status}!`)
            console.log("(ya boi needs to add some logic to handle this...)")
            console.log(response)
        }

        // finished loading
        this.setState({
            loading: false
        })
    }
}