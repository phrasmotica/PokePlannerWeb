import React, { Component } from "react"
import key from "weak-key"

import { IHasIndex, IHasVersionGroup } from "../CommonMembers"

import { PokemonAbilityContext } from "../../models/AbilityEntry"

import "./AbilityList.scss"

interface IAbilityListProps extends IHasIndex, IHasVersionGroup {
    /**
     * The ID of the Pokemon to show abilities for.
     */
    pokemonId: number | undefined

    /**
     * Whether to show the abilities.
     */
    showAbilities: boolean
}

interface IAbilityListState {
    /**
     * The abilities to show.
     */
    abilities: PokemonAbilityContext[]

    /**
     * Whether we're loading the abilities.
     */
    loadingAbilities: boolean
}

/**
 * Component for displaying a Pokemon's abilities.
 */
export class AbilityList extends Component<IAbilityListProps, IAbilityListState> {
    constructor(props: IAbilityListProps) {
        super(props)
        this.state = {
            abilities: [],
            loadingAbilities: false
        }
    }

    /**
     * Fetch abilities.
     */
    componentDidMount() {
        this.fetchAbilities()
    }

    /**
     * Refresh abilities if the Pokemon ID changed.
     */
    componentDidUpdate(previousProps: IAbilityListProps) {
        let previousPokemonId = previousProps.pokemonId
        let pokemonId = this.props.pokemonId
        let pokemonChanged = pokemonId !== previousPokemonId

        if (pokemonChanged) {
            this.fetchAbilities()
        }
    }

    render() {
        return (
            <div className="abilityListContainer">
                <div className="abilityList" style={{ marginTop: 4 }}>
                    {this.renderAbilities()}
                </div>
            </div>
        )
    }

    /**
     * Renders the abilities.
     */
    renderAbilities() {
        if (this.props.pokemonId === undefined) {
            return (
                <div className="flex-center margin-bottom-small">
                    -
                </div>
            )
        }

        if (this.state.loadingAbilities) {
            return (
                <div className="flex-center margin-bottom-small">
                    Loading...
                </div>
            )
        }

        let abilities = this.state.abilities
        let items = []
        if (this.props.showAbilities && abilities.length > 0) {
            for (let ability of abilities) {
                let abilityName = ability.getDisplayName("en") ?? "ability"
                let hiddenText = ability.isHidden ? " (hidden)" : ""

                let nameElement = (
                    <div className="abilityName">
                        <b>
                            {abilityName}
                        </b>
                        {hiddenText}
                    </div>
                )

                let flavourTextElement = (
                    <div className="abilityFlavourText">
                        {ability.getFlavourText(this.props.versionGroupId!, "en")}
                    </div>
                )

                items.push(
                    <div
                        key={key(ability)}
                        className="abilityItem">
                        {nameElement}
                        {flavourTextElement}
                    </div>
                )
            }
        }

        return (
            <div className="flex margin-bottom-small">
                {items}
            </div>
        )
    }

    /**
     * Retrieves the Pokemon's abilities from PokemonController.
     */
    fetchAbilities() {
        let pokemonId = this.props.pokemonId
        if (pokemonId !== undefined) {
            console.log(`Ability list ${this.props.index}: getting abilities for Pokemon ${pokemonId}...`)

            // loading begins
            this.setState({ loadingAbilities: true })

            // construct endpoint URL
            let endpointUrl = this.constructEndpointUrl(pokemonId)

            // get abilities
            fetch(endpointUrl)
                .then(response => {
                    if (response.status === 200) {
                        return response
                    }

                    throw new Error(`Ability list ${this.props.index}: tried to get abilities for Pokemon ${pokemonId} but failed with status ${response.status}!`)
                })
                .then(response => response.json())
                .then((abilities: PokemonAbilityContext[]) => {
                    let concreteAbilities = abilities.map(PokemonAbilityContext.from)
                    this.setState({ abilities: concreteAbilities })
                })
                .catch(error => console.error(error))
                .then(() => this.setState({ loadingAbilities: false }))
        }
    }

    /**
     * Returns the endpoint to use when fetching abilities of the Pokemon with the given ID.
     */
    constructEndpointUrl(pokemonId: number): string {
        return `${process.env.REACT_APP_API_URL}/pokemon/${pokemonId}/abilities`
    }
}