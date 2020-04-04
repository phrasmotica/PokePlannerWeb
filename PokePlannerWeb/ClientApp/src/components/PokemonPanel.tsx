import React, { Component } from "react"
import { FormGroup, CustomInput } from "reactstrap"
import { Tabs, Tab } from "react-bootstrap"
import { EfficacyList } from "./EfficacyList"
import { PokemonSelector } from "./PokemonSelector"
import { StatGraph } from "./StatGraph"
import { CaptureLocations } from "./CaptureLocations"

import { PokemonEntry } from "../models/PokemonEntry"
import { PokemonSpeciesEntry } from "../models/PokemonSpeciesEntry"
import { TypesPresenceMap } from "../models/TypesPresenceMap"

import "../styles/types.scss"
import "./PokemonPanel.scss"
import "./TeamBuilder.scss"
import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "./CommonMembers"
import { PokemonFormEntry } from "../models/PokemonFormEntry"

interface IPokemonPanelProps extends IHasIndex, IHasVersionGroup, IHasHideTooltips {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean

    /**
     * List of Pokemon species.
     */
    species: PokemonSpeciesEntry[]

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
 * Component for selecting a Pokemon and displaying information about it.
 */
export class PokemonPanel extends Component<IPokemonPanelProps, IPokemonPanelState> {
    constructor(props: IPokemonPanelProps) {
        super(props)
        this.state = {
            speciesId: undefined,
            variety: undefined,
            form: undefined,
            showShinySprite: false
        }
    }

    render() {
        // handlers
        const clearPokemon = () => this.clearPokemon()
        const setSpecies = (speciesId: number) => this.setSpecies(speciesId)
        const setVariety = (variety: PokemonEntry) => this.setVariety(variety)
        const setForm = (form: PokemonFormEntry) => this.setForm(form)
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
                        clearPokemon={clearPokemon}
                        setSpecies={setSpecies}
                        setVariety={setVariety}
                        setForm={setForm}
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

    /**
     * Returns the Pokemon's effective types.
     */
    getEffectiveTypes() {
        let variety = this.state.variety
        if (variety === undefined) {
            return []
        }

        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(`Panel ${this.props.index}: version group ID is undefined!`)
        }

        let types = variety.getTypes(versionGroupId)

        let form = this.state.form
        if (form !== undefined) {
            let formTypes = form.getTypes(versionGroupId)
            if (formTypes.length > 0) {
                // use form-specific types if present
                types = formTypes
            }
        }

        return types
    }

    // returns the Pokemon's sprite
    renderPokemonSprite() {
        let spriteUrl = ""
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon) {
            let dataObject = this.getEffectiveDataObject()
            if (dataObject !== undefined) {
                spriteUrl = this.state.showShinySprite
                            ? dataObject.shinySpriteUrl
                            : dataObject.spriteUrl
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

    /**
     * Returns the variety or form data object as needed.
     */
    getEffectiveDataObject() {
        let form = this.state.form
        if (form !== undefined) {
            return form
        }

        return this.state.variety
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
        let baseStats: number[] = []

        let variety = this.state.variety
        if (variety !== undefined) {
            let versionGroupId = this.props.versionGroupId
            if (versionGroupId === undefined) {
                throw new Error(`Panel ${this.props.index}: version group ID is undefined!`)
            }

            baseStats = variety.getBaseStats(versionGroupId)
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
                typeIds={types.map(type => type.id)}
                typesPresenceMap={this.props.typesPresenceMap}
                versionGroupId={this.props.versionGroupId}
                showMultipliers={this.shouldShowPokemon()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    // returns the capture locations
    renderCaptureLocations() {
        return (
            <CaptureLocations
                index={this.props.index}
                pokemonId={this.state.variety?.pokemonId}
                versionGroupId={this.props.versionGroupId}
                showLocations={this.shouldShowPokemon()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    // toggle the shiny sprite
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

    // returns whether we have a species
    hasSpecies() {
        return this.state.speciesId !== undefined
    }

    // returns whether the Pokemon is valid
    pokemonIsValid() {
        let versionGroupId = this.props.versionGroupId
        if (versionGroupId === undefined) {
            throw new Error(`Panel ${this.props.index}: version group ID is undefined!`)
        }

        let pokemonIsValid = this.getSpecies().isValid(versionGroupId)

        let form = this.state.form
        if (form !== undefined && form.hasValidity()) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && form.isValid(versionGroupId)
        }

        return pokemonIsValid
    }

    // returns true if the Pokemon should be displayed
    shouldShowPokemon() {
        return this.hasSpecies()
            && this.state.form !== undefined
            && (this.props.ignoreValidity || this.pokemonIsValid())
    }

    // set the species ID
    setSpecies(speciesId: number) {
        this.setState({ speciesId: speciesId })
    }

    // remove all Pokemon data from this panel
    clearPokemon() {
        this.setState({
            speciesId: undefined,
            variety: undefined,
            form: undefined
        })
    }

    // set the species variety
    setVariety(variety: PokemonEntry) {
        this.setState({ variety: variety })
    }

    // set the Pokemon form
    setForm(form: PokemonFormEntry) {
        this.setState({ form: form })
    }
}
