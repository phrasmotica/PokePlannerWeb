import React, { Component } from "react"
import { FormGroup, CustomInput } from "reactstrap"
import key from "weak-key"

import { IHasCommon } from "../CommonMembers"

import { PokemonSelector } from "../PokemonSelector/PokemonSelector"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"

import { PokemonHelper } from "../../util/PokemonHelper"

interface IPokemonPanelProps extends IHasCommon {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * The ID of the species to be selected by default.
     */
    defaultSpeciesId: number | undefined

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

    /**
     * List of generations.
     */
    generations: GenerationEntry[]

    /**
     * Handler for setting the species ID in the parent component.
     */
    setSpecies: (speciesId: number | undefined) => void

    /**
     * Handler for setting the Pokemon variety in the parent component.
     */
    setVariety: (variety: PokemonEntry) => void

    /**
     * Handler for clearing the Pokemon in the parent component.
     */
    clearPokemon: () => void

    /**
     * Handler for setting the Pokemon form in the parent component.
     */
    setForm: (form: PokemonFormEntry) => void

    /**
     * Handler for toggling the shiny sprite.
     */
    toggleShowShinySprite: () => void

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokemonPanelState {
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
 * Component for selecting a Pokemon and viewing basic information about it.
 */
export class PokemonPanel extends Component<IPokemonPanelProps, IPokemonPanelState> {
    /**
     * Constructor.
     */
    constructor(props: IPokemonPanelProps) {
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
        const clearPokemon = () => this.clearPokemon()
        const setSpecies = (speciesId: number | undefined) => this.setSpecies(speciesId)
        const setVariety = (variety: PokemonEntry) => this.setVariety(variety)
        const setForm = (form: PokemonFormEntry) => this.setForm(form)
        const toggleIgnoreValidity = () => this.props.toggleIgnoreValidity()

        return (
            <div className="flex debug-border hhalf">
                <div className="flex-center w60 debug-border">
                    <PokemonSelector
                        index={this.props.index}
                        versionGroupId={this.props.versionGroupId}
                        species={this.props.species}
                        defaultSpeciesId={this.props.defaultSpeciesId}
                        ignoreValidity={this.props.ignoreValidity}
                        generations={this.props.generations}
                        hideTooltips={this.props.hideTooltips}
                        clearPokemon={clearPokemon}
                        setSpecies={setSpecies}
                        setVariety={setVariety}
                        setForm={setForm}
                        toggleIgnoreValidity={toggleIgnoreValidity} />
                </div>

                <div className="flex-center w40 debug-border">
                    {this.renderPokemonInfo()}
                </div>
            </div>
        )
    }

    /**
     * Renders the Pokemon info.
     */
    renderPokemonInfo() {
        return (
            <div>
                <div>
                    {this.renderPokemonName()}

                    {this.renderPokemonTypes()}
                </div>

                <div>
                    {this.renderPokemonSprite()}

                    {this.renderShinySpriteSwitch()}
                </div>
            </div>
        )
    }

    // returns the Pokemon's name
    renderPokemonName() {
        let displayNameElement = "-"
        if (this.shouldShowPokemon()) {
            displayNameElement = this.getEffectiveDisplayName() ?? "-"
        }

        return (
            <div className="center-text">
                {displayNameElement}
            </div>
        )
    }

    /**
     * Returns the Pokemon's effective display name.
     */
    getEffectiveDisplayName() {
        // default to species display name
        let displayName = this.getSpecies().getDisplayName("en")

        let form = this.state.form
        if (form !== undefined && form.hasDisplayNames()) {
            displayName = form.getDisplayName("en") ?? displayName
        }

        return displayName
    }

    // returns the Pokemon's types
    renderPokemonTypes() {
        let typesElement: any = "-"
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon) {
            let types = this.getEffectiveTypes()

            typesElement = types.map(type => {
                return (
                    <div
                        key={key(type)}
                        className="flex-center fill-parent">
                        <img
                            key={key(type)}
                            className={"type-icon padded" + (shouldShowPokemon ? "" : " hidden")}
                            alt={`type${type.id}`}
                            src={require(`../../images/typeIcons/${type.id}-small.png`)} />
                    </div>
                )
            })
        }

        return (
            <div className="flex-center type-pair">
                {typesElement}
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

    // returns the Pokemon's sprite
    renderPokemonSprite() {
        let spriteUrl = ""
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon) {
            let dataObject = this.state.form ?? this.state.variety
            if (dataObject !== undefined) {
                spriteUrl = this.state.showShinySprite
                    ? dataObject.shinySpriteUrl
                    : dataObject.spriteUrl
            }

            if (spriteUrl === null || spriteUrl === "") {
                return (
                    <div className="flex-center sprite margin-auto-horiz">
                        (no sprite)
                    </div>
                )
            }
        }

        return (
            <div className="sprite margin-auto-horiz">
                <img
                    className={"inherit-size" + (shouldShowPokemon ? "" : " hidden")}
                    alt={`sprite${this.props.index}`}
                    src={spriteUrl} />
            </div>
        )
    }

    // returns a switch that toggles between default and shiny sprites
    renderShinySpriteSwitch() {
        return (
            <FormGroup
                className="flex-center"
                style={{ marginBottom: 0 }}>
                <CustomInput
                    type="switch"
                    id={"toggleShinySpriteSwitch" + this.props.index}
                    checked={this.state.showShinySprite}
                    label={this.state.showShinySprite ? "Shiny" : "Default"}
                    onChange={() => this.toggleShowShinySprite()} />
            </FormGroup>
        )
    }

    /**
     * Toggles the shiny sprite.
     */
    toggleShowShinySprite() {
        this.setState(previousState => ({
            showShinySprite: !previousState.showShinySprite
        }))

        this.props.toggleShowShinySprite()
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

            this.props.setSpecies(speciesId)
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

        this.props.clearPokemon()
    }

    /**
     * Sets the species variety.
     */
    setVariety(variety: PokemonEntry) {
        this.setState({ variety: variety })

        this.props.setVariety(variety)
    }

    /**
     * Sets the Pokemon form.
     */
    setForm(form: PokemonFormEntry) {
        this.setState({ form: form })

        this.props.setForm(form)
    }
}
