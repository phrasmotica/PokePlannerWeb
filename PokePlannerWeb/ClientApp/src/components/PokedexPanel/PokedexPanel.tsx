import React, { Component } from "react"
import { Tabs, Tab } from "react-bootstrap"

import { CaptureLocations } from "../CaptureLocations/CaptureLocations"
import { EfficacyList } from "../EfficacyList/EfficacyList"
import { EvolutionChain } from "../EvolutionChain/EvolutionChain"
import { MoveList } from "../MoveList/MoveList"
import { PokemonPanel } from "../PokemonPanel/PokemonPanel"
import { StatGraph } from "../StatGraph/StatGraph"

import { IHasIndex, IHasVersionGroup, IHasHideTooltips } from "../CommonMembers"

import { GenerationEntry } from "../../models/GenerationEntry"
import { PokemonEntry } from "../../models/PokemonEntry"
import { PokemonFormEntry } from "../../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../../models/PokemonSpeciesEntry"
import { TypesPresenceMap } from "../../models/TypesPresenceMap"

import { CookieHelper } from "../../util/CookieHelper"
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

    /**
     * The key of the active info tab.
     */
    activeInfoTabKey: string | undefined

    /**
     * The key of the active move tab.
     */
    activeMoveTabKey: string | undefined
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
            showShinySprite: false,
            activeInfoTabKey: CookieHelper.get(`panel${this.props.index}activeInfoTabKey`),
            activeMoveTabKey: CookieHelper.get(`panel${this.props.index}activeMoveTabKey`)
        }
    }

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
                        <Tabs
                            className="tabpane-small"
                            transition={false}
                            activeKey={this.state.activeInfoTabKey}
                            defaultActiveKey="stats"
                            onSelect={(k: string) => this.setActiveInfoTabKey(k)}
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

                <div className="debug-border whalf" style={{ fontSize: "10pt" }}>
                    <Tabs
                        className="tabpane-small"
                        id="movesTabs"
                        transition={false}
                        activeKey={this.state.activeMoveTabKey}
                        defaultActiveKey="moves"
                        onSelect={(k: string) => this.setActiveMoveTabKey(k)}>
                        <Tab eventKey="moves" title="Moves">
                            {this.renderMoveList()}
                        </Tab>

                        <Tab eventKey="evolution" title="Evolution">
                            {this.renderEvolutionChain()}
                        </Tab>
                    </Tabs>
                </div>
            </div>
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
     * Renders the move list.
     */
    renderMoveList() {
        let typeIds = this.getEffectiveTypes().map(t => t.id)

        return (
            <MoveList
                index={this.props.index}
                versionGroupId={this.props.versionGroupId}
                pokemonId={this.state.variety?.pokemonId}
                typeIds={typeIds}
                showMoves={this.shouldShowPokemon()}
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

    /**
     * Renders the evolution chain.
     */
    renderEvolutionChain() {
        const setSpecies = (speciesId: number) => this.setSpecies(speciesId)

        return (
            <div className="inherit-size">
                <EvolutionChain
                    index={this.props.index}
                    speciesId={this.state.speciesId}
                    availableSpeciesIds={this.props.species.map(s => s.speciesId)}
                    showShinySprites={this.state.showShinySprite}
                    shouldShowChain={this.shouldShowPokemon()}
                    setSpecies={setSpecies} />
            </div>
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

    /**
     * Sets the key of the active info tab.
     */
    setActiveInfoTabKey(key: string) {
        CookieHelper.set(`panel${this.props.index}activeInfoTabKey`, key)
        this.setState({ activeInfoTabKey: key })
    }

    /**
     * Sets the key of the active move tab.
     */
    setActiveMoveTabKey(key: string) {
        CookieHelper.set(`panel${this.props.index}activeMoveTabKey`, key)
        this.setState({ activeMoveTabKey: key })
    }
}
