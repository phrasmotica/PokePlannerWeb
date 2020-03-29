import React, { Component } from "react"
import { Spinner, FormGroup, CustomInput } from "reactstrap"
import { Tabs, Tab } from "react-bootstrap"
import { EfficacyList } from "./EfficacyList"
import { PokemonSelector } from "./PokemonSelector"
import { StatGraph } from "./StatGraph"
import { CaptureLocations } from "./CaptureLocations"
import { TypeSet } from "../models/TypeSet"

import "../styles/types.scss"
import "./PokemonPanel.scss"
import "./TeamBuilder.scss"
import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "./CommonMembers"

interface IPokemonPanelProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * List of Pokemon species.
     */
    species: any[]

    /**
     * The type set.
     */
    typeSet: TypeSet

    /**
     * The base stat names.
     */
    baseStatNames: string[]

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface IPokemonPanelState {
    /**
     * The Pokemon.
     */
    pokemon: any

    /**
     * The ID of the Pokemon species.
     */
    speciesId: number | undefined

    /**
     * The Pokemon form.
     */
    form: any

    /**
     * The species variety.
     */
    variety: any

    /**
     * The Pokemon's name.
     */
    displayName: string

    /**
     * Whether we're loading the Pokemon's name.
     */
    loadingDisplayName: boolean

    /**
     * The URL of the Pokemon's sprite.
     */
    spriteUrl: string

    /**
     * Whether we're loading the URL of the Pokemon's sprite.
     */
    loadingSpriteUrl: boolean

    /**
     * The URL of the Pokemon's shiny sprite.
     */
    shinySpriteUrl: string

    /**
     * Whether we're loading the URL of the Pokemon's shiny sprite.
     */
    loadingShinySpriteUrl: boolean

    /**
     * The Pokemon's types.
     */
    typeNames: string[]

    /**
     * Whether we're loading the Pokemon's types.
     */
    loadingTypeNames: boolean

    /**
     * Whether to show the shiny sprite.
     */
    showShinySprite: boolean
}

/**
 * Component for selecting a Pokemon and displaying information about it.
 */
export class PokemonPanel extends Component<IPokemonPanelProps, IPokemonPanelState> {
    constructor(props: any) {
        super(props)
        this.state = {
            pokemon: null,
            speciesId: undefined,
            form: null,
            variety: null,
            displayName: "",
            loadingDisplayName: false,
            spriteUrl: "",
            loadingSpriteUrl: false,
            shinySpriteUrl: "",
            loadingShinySpriteUrl: false,
            typeNames: [],
            loadingTypeNames: false,
            showShinySprite: false
        }
    }

    render() {
        // handlers
        const setPokemon = (pokemon: any) => this.setPokemon(pokemon)
        const clearPokemon = () => this.clearPokemon()
        const setSpecies = (speciesId: number) => this.setSpecies(speciesId)
        const setForm = (form: any) => this.setForm(form)
        const setVariety = (variety: any) => this.setVariety(variety)
        const toggleIgnoreValidity = () => this.props.toggleIgnoreValidity()

        return (
            <div className="margin-right">
                <div className="flex">
                    <PokemonSelector
                        index={this.props.index}
                        versionGroupId={this.props.versionGroupId}
                        species={this.props.species}
                        ignoreValidity={this.props.ignoreValidity}
                        hideTooltips={this.props.ignoreValidity}
                        setPokemon={setPokemon}
                        clearPokemon={clearPokemon}
                        setSpecies={setSpecies}
                        setForm={setForm}
                        setVariety={setVariety}
                        toggleIgnoreValidity={toggleIgnoreValidity} />

                    {this.renderPokemonInfo()}
                </div>

                <div
                    className="margin-bottom"
                    style={{ fontSize: "10pt" }}>
                    <Tabs
                        transition={false}
                        className="tabpane-small"
                        defaultActiveKey="stats"
                        id="infoTabs">
                        <Tab eventKey="stats" title="Base Stats">
                            {this.renderStatsGraph()}
                        </Tab>

                        <Tab eventKey="efficacy" title="Efficacy">
                            {this.renderEfficacyList()}
                        </Tab>

                        <Tab eventKey="locations" title="Capture Locations">
                            {this.renderCaptureLocations()}
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }

    // returns the Pokemon info
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
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon && this.isLoading()) {
            return (
                <div className="center-text loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let displayNameElement = "-"
        if (shouldShowPokemon) {
            let dataObject = this.getDataObject()
            let matchingData = dataObject.displayNames.filter((n: any) => n.language === "en")

            if (matchingData.length > 0) {
                // Pokemon's name derived from its form
                let displayName = matchingData[0].name
                displayNameElement = displayName
            }
            else {
                // Pokemon's name derived from its species
                let species = this.props.species.filter((s: any) => s.speciesId === this.state.speciesId)[0]
                matchingData = species.displayNames.filter((n: any) => n.language === "en")
                let displayName = matchingData[0].name
                displayNameElement = displayName
            }
        }

        return (
            <div className="center-text">
                {displayNameElement}
            </div>
        )
    }

    // returns the Pokemon's types
    renderPokemonTypes() {
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon && this.isLoading()) {
            return (
                <div className="flex-center type-pair loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let typesElement = "-"
        if (shouldShowPokemon) {
            // favour the form's types
            let dataObject = this.getDataObject()
            let matchingTypes = dataObject.types.filter((t: any) => t.id === this.props.versionGroupId)
            let types = matchingTypes[0].data

            if (types.length <= 0) {
                matchingTypes = this.state.pokemon.types.filter((t: any) => t.id === this.props.versionGroupId)
                types = matchingTypes[0].data
            }

            typesElement = types.map((type: any) => {
                return (
                    <div
                        key={type.id}
                        className="flex-center fill-parent">
                        <img
                            key={type.id}
                            className={"type-icon padded" + (shouldShowPokemon ? "" : " hidden")}
                            alt={`type${type.id}`}
                            src={require(`../images/typeIcons/${type.id}-small.png`)} />
                    </div>
                )
            })
        }

        return (
            <div className={"flex-center type-pair"}>
                {typesElement}
            </div>
        )
    }

    // returns the Pokemon's sprite
    renderPokemonSprite() {
        let shouldShowPokemon = this.shouldShowPokemon()
        let isLoading = this.isLoading()
        if (shouldShowPokemon && isLoading) {
            return (
                <div className="sprite margin-auto-horiz flex-center loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let spriteUrl = ""
        if (shouldShowPokemon) {
            let dataObject = this.getDataObject()
            spriteUrl = this.state.showShinySprite
                        ? dataObject.shinySpriteUrl
                        : dataObject.spriteUrl
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

    // returns a graph of the Pokemon's base stats
    renderStatsGraph() {
        let baseStats = []
        let dataObject = null

        // form has no base stat data so we ignore it
        if (this.hasVariety()) {
            dataObject = this.state.variety
        }
        else {
            dataObject = this.state.pokemon
        }

        if (dataObject !== null) {
            baseStats = dataObject.baseStats.filter(
                (bs: any) => bs.id === this.props.versionGroupId
            )[0].data
        }

        return (
            <StatGraph
                index={this.props.index}
                statNames={this.props.baseStatNames}
                statValues={baseStats}
                shouldShowStats={this.shouldShowPokemon()} />
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        let types = this.getEffectiveTypes()

        return (
            <EfficacyList
                index={this.props.index}
                typeIds={types.map((type: any) => type.id)}
                typeSet={this.props.typeSet}
                versionGroupId={this.props.versionGroupId}
                parentIsLoading={this.isLoading()}
                showMultipliers={this.shouldShowPokemon()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    /**
     * Returns the Pokemon's effective types.
     */
    getEffectiveTypes() {
        if (this.state.pokemon === null) {
            return []
        }

        let baseTypes = this.state.pokemon.types.filter(
            (type: any) => type.id === this.props.versionGroupId
        )[0].data

        let variant = null
        if (this.hasVariety()) {
            variant = this.state.variety
        }
        else if (this.hasForm()) {
            variant = this.state.form
        }
        else {
            // no variant => use base types
            return baseTypes
        }

        let types = variant.types.filter(
            (type: any) => type.id === this.props.versionGroupId
        )[0].data

        if (types.length > 0) {
            // variant has different types
            return types
        }

        return baseTypes
    }

    // returns the capture locations
    renderCaptureLocations() {
        // TODO: show capture locations of selected variety
        return (
            <CaptureLocations
                index={this.props.index}
                pokemonId={this.state.pokemon?.pokemonId}
                versionGroupId={this.props.versionGroupId}
                parentIsLoading={this.isLoading()}
                showLocations={this.shouldShowPokemon()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" size="sm" />
    }

    // toggle the shiny sprite
    toggleShowShinySprite() {
        this.setState(previousState => ({
            showShinySprite: !previousState.showShinySprite
        }))
    }

    // returns whether this component is loading
    isLoading() {
        return this.state.loadingDisplayName
            || this.state.loadingSpriteUrl
            || this.state.loadingTypeNames
    }

    /**
     * Returns the variety, form or base Pokemon for rendering as needed.
     */
    getDataObject() {
        if (this.hasVariety()) {
            return this.state.variety
        }

        if (this.hasForm()) {
            return this.state.form
        }

        if (this.hasPokemon()) {
            return this.state.pokemon
        }

        return null
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.state.pokemon !== null
    }

    // returns true if we have a Pokemon form
    hasForm() {
        return this.state.form !== null
    }

    // returns true if we have a species variety
    hasVariety() {
        return this.state.variety !== null
    }

    // returns true if the Pokemon is valid
    pokemonIsValid() {
        let validityArr = this.state.pokemon.validity
        return validityArr.filter(
            (v: any) => v.id === this.props.versionGroupId
        )[0].data
    }

    // returns true if the Pokemon should be displayed
    shouldShowPokemon() {
        return this.hasPokemon()
            && this.hasForm()
            && (this.props.ignoreValidity || this.pokemonIsValid())
    }

    // set the species ID
    setSpecies(speciesId: number) {
        this.setState({ speciesId: speciesId })
    }

    // set the Pokemon
    setPokemon(pokemon: any) {
        this.setState({ pokemon: pokemon })
    }

    // remove all Pokemon data from this panel
    clearPokemon() {
        this.setState({
            speciesId: undefined,
            pokemon: null,
            form: null
        })
    }

    // set the Pokemon form
    setForm(form: any) {
        this.setState({ form: form })
    }

    // set the species variety
    setVariety(variety: any) {
        this.setState({ variety: variety })
    }
}
