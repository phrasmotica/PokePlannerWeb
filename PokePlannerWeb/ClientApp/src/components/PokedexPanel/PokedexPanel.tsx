import React, { Component } from "react"

import { ActionPanel } from "../ActionPanel/ActionPanel"
import { InfoPanel } from "../InfoPanel/InfoPanel"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { TypesPresenceMap } from "../../models/TypesPresenceMap"

import { PokemonHelper } from "../../util/PokemonHelper"

import "./PokedexPanel.scss"
import "./../TeamBuilder/TeamBuilder.scss"
import "../../styles/types.scss"

interface IPokedexPanelProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * The types presence map.
     */
    typesPresenceMap: TypesPresenceMap

    /**
     * The base stat names.
     */
    baseStatNames: string[]

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokedexPanelState {
    /**
     * The ID of the Pokemon species.
     */
    speciesId: number | undefined

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
            speciesId: undefined,
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
        const setSpecies = (speciesId: number | undefined) => this.setSpecies(speciesId)
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
                        versionGroupId={this.props.versionGroupId}
                        species={this.props.species}
                        defaultSpeciesId={this.state.speciesId}
                        generations={this.props.generations}
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
                            versionGroupId={this.props.versionGroupId}
                            hideTooltips={this.props.hideTooltips}
                            pokemon={this.state.variety}
                            effectiveTypes={this.getEffectiveTypes()}
                            typesPresenceMap={this.props.typesPresenceMap}
                            baseStatNames={this.props.baseStatNames}
                            shouldShowPokemon={this.shouldShowPokemon()} />
                    </div>
                </div>

                <div className="debug-border whalf" style={{ fontSize: "10pt" }}>
                    <ActionPanel
                        index={this.props.index}
                        versionGroupId={this.props.versionGroupId}
                        hideTooltips={this.props.hideTooltips}
                        species={this.props.species}
                        speciesId={this.state.speciesId}
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
            this.props.versionGroupId
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
        let speciesId = this.state.speciesId
        let species = this.props.species.find(s => s.speciesId === speciesId)

        if (species === undefined) {
            throw new Error(
                `Panel ${this.props.index}: no species found with ID ${speciesId}!`
            )
        }

        return species
    }

    /**
     * Returns whether we have a species.
     */
    hasSpecies() {
        return this.state.speciesId !== undefined
    }

    /**
     * Returns whether the Pokemon is valid.
     */
    pokemonIsValid() {
        return PokemonHelper.pokemonIsValid(
            this.getSpecies(),
            this.state.form,
            this.props.versionGroupId
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
    setSpecies(speciesId: number | undefined) {
        if (speciesId === undefined) {
            this.clearPokemon()
        }
        else {
            this.setState({ speciesId: speciesId })
        }
    }

    /**
     * Clears all Pokemon state.
     */
    clearPokemon() {
        this.setState({
            speciesId: undefined,
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
