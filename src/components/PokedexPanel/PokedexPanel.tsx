import React, { Component } from "react"

import { ActionPanel } from "../ActionPanel/ActionPanel"
import { InfoPanel } from "../InfoPanel/InfoPanel"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"

import { IHasIndex, IHasHideTooltips } from "../CommonMembers"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { StatEntry } from "../../models/StatEntry"
import { TypeEntry } from "../../models/TypeEntry"
import { VersionGroupEntry } from "../../models/VersionGroupEntry"

import { PokemonHelper } from "../../util/PokemonHelper"

import "./PokedexPanel.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"

interface IPokedexPanelProps extends IHasIndex, IHasHideTooltips {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * The version group.
     */
    versionGroup: VersionGroupEntry | undefined

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * List of types.
     */
    types: TypeEntry[]

    /**
     * The base stats.
     */
    baseStats: StatEntry[]

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokedexPanelState {
    /**
     * The ID of the Pokemon species.
     */
    pokemonSpeciesId: number | undefined

    /**
     * The species variety.
     */
    variety: PokemonEntry | undefined

    /**
     * The Pokemon form.
     */
    form: PokemonFormEntry | undefined

    /**
     * Whether to show the shiny sprite.
     */
    showShinySprite: boolean
}

/**
 * Component for selecting a Pokemon and displaying information about it.
 */
export class PokedexPanel extends Component<IPokedexPanelProps, IPokedexPanelState> {
    constructor(props: IPokedexPanelProps) {
        super(props)
        this.state = {
            pokemonSpeciesId: undefined,
            variety: undefined,
            form: undefined,
            showShinySprite: false
        }
    }

    /**
     * Renders the component.
     */
    render() {
        // handlers
        const setSpecies = (pokemonSpeciesId: number | undefined) => this.setSpecies(pokemonSpeciesId)
        const clearPokemon = () => this.clearPokemon()
        const setVariety = (variety: PokemonEntry) => this.setVariety(variety)
        const setForm = (form: PokemonFormEntry) => this.setForm(form)
        const toggleShowShinySprite = () => this.toggleShowShinySprite()
        const toggleIgnoreValidity = () => this.props.toggleIgnoreValidity()

        return (
            <div className="flex pokedex-panel debug-border">
                <div className="debug-border whalf">
                    <PokemonPanel
                        index={this.props.index}
                        versionGroupId={this.props.versionGroup?.versionGroupId}
                        species={this.props.species}
                        defaultSpeciesId={this.state.pokemonSpeciesId}
                        generations={this.props.generations}
                        types={this.props.types}
                        baseStats={this.props.baseStats}
                        hideTooltips={this.props.hideTooltips}
                        ignoreValidity={this.props.ignoreValidity}
                        setSpecies={setSpecies}
                        clearPokemon={clearPokemon}
                        setVariety={setVariety}
                        setForm={setForm}
                        toggleShowShinySprite={toggleShowShinySprite}
                        toggleIgnoreValidity={toggleIgnoreValidity} />

                    <div className="debug-border hhalf" style={{ fontSize: "10pt" }}>
                        <InfoPanel
                            index={this.props.index}
                            versionGroup={this.props.versionGroup}
                            hideTooltips={this.props.hideTooltips}
                            versions={this.props.versionGroup?.versions ?? []}
                            species={this.getSpecies()}
                            pokemon={this.state.variety}
                            effectiveTypes={this.getEffectiveTypes()}
                            types={this.props.types}
                            baseStats={this.props.baseStats}
                            shouldShowPokemon={this.shouldShowPokemon()} />
                    </div>
                </div>

                <div className="debug-border whalf flex-down" style={{ fontSize: "10pt" }}>
                    <ActionPanel
                        index={this.props.index}
                        versionGroup={this.props.versionGroup}
                        hideTooltips={this.props.hideTooltips}
                        species={this.props.species}
                        pokemonSpeciesId={this.state.pokemonSpeciesId}
                        variety={this.state.variety}
                        form={this.state.form}
                        shouldShowPokemon={this.shouldShowPokemon()}
                        showShinySprite={this.state.showShinySprite}
                        setSpecies={setSpecies} />
                </div>
            </div>
        )
    }

    /**
     * Returns the Pokemon's effective types.
     */
    getEffectiveTypes() {
        return PokemonHelper.getEffectiveTypes(
            this.state.variety,
            this.state.form,
            this.props.versionGroup?.versionGroupId
        )
    }

    /**
     * Toggles the shiny sprite.
     */
    toggleShowShinySprite() {
        this.setState(previousState => ({
            showShinySprite: !previousState.showShinySprite
        }))
    }

    /**
     * Returns the data object for the selected species.
     */
    getSpecies() {
        let speciesId = this.state.pokemonSpeciesId
        return this.props.species.find(s => s.pokemonSpeciesId === speciesId)
    }

    /**
     * Returns whether we have a species.
     */
    hasSpecies() {
        return this.state.pokemonSpeciesId !== undefined
    }

    /**
     * Returns whether the Pokemon is valid.
     */
    pokemonIsValid() {
        let species = this.getSpecies()
        if (species === undefined) {
            return true
        }

        return PokemonHelper.pokemonIsValid(
            species,
            this.state.form,
            this.props.versionGroup?.versionGroupId
        )
    }

    /**
     * Returns whether the Pokemon should be displayed.
     */
    shouldShowPokemon() {
        return this.hasSpecies()
            && this.state.form !== undefined
            && (this.props.ignoreValidity || this.pokemonIsValid())
    }

    /**
     * Sets the species ID.
     */
    setSpecies(pokemonSpeciesId: number | undefined) {
        if (pokemonSpeciesId === undefined) {
            this.clearPokemon()
        }
        else {
            this.setState({ pokemonSpeciesId: pokemonSpeciesId })
        }
    }

    /**
     * Clears all Pokemon state.
     */
    clearPokemon() {
        this.setState({
            pokemonSpeciesId: undefined,
            variety: undefined,
            form: undefined
        })
    }

    /**
     * Sets the species variety.
     */
    setVariety(variety: PokemonEntry) {
        this.setState({ variety: variety })
    }

    /**
     * Sets the Pokemon form.
     */
    setForm(form: PokemonFormEntry) {
        this.setState({ form: form })
    }
}
