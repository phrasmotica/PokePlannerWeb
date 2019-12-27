import React, { Component } from "react"
import { Spinner, Button, Collapse, FormGroup, CustomInput } from "reactstrap"
import { EfficacyList } from "./EfficacyList"
import { PokemonValidity } from "../models/PokemonValidity"
import { TypeSet } from "../models/TypeSet"

import "../styles/types.scss"
import "./PokemonPanel.scss"
import "./TeamBuilder.scss"
import { PokemonSelector } from "./PokemonSelector"

interface PokemonPanelProps {
    /**
     * The index of this Pokemon panel.
     */
    index: number,

    /**
     * The index of the selected version group.
     */
    versionGroupIndex: number,

    /**
     * Whether species validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean,

    /**
     * List of Pokemon species names.
     */
    speciesNames: string[],

    /**
     * The type set.
     */
    typeSet: TypeSet,

    /**
     * The base stat names.
     */
    baseStatNames: string[],

    /**
     * Optional handler for toggling the ignore validity setting.
     */
    toggleIgnoreValidity: () => void | null
}

interface PokemonPanelState {
    /**
     * The Pokemon ID.
     */
    pokemonId: number,

    /**
     * Value describing the Pokemon validity.
     */
    pokemonValidity: PokemonValidity,

    /**
     * The Pokemon's name.
     */
    pokemonName: string,

    /**
     * Whether we're loading the Pokemon's name.
     */
    loadingPokemonName: boolean,

    /**
     * The URL of the Pokemon's sprite.
     */
    pokemonSpriteUrl: string,

    /**
     * Whether we're loading the URL of the Pokemon's sprite.
     */
    loadingPokemonSpriteUrl: boolean,

    /**
     * The URL of the Pokemon's shiny sprite.
     */
    pokemonShinySpriteUrl: string,

    /**
     * Whether we're loading the URL of the Pokemon's shiny sprite.
     */
    loadingPokemonShinySpriteUrl: boolean,

    /**
     * The Pokemon's types.
     */
    pokemonTypes: string[],

    /**
     * Whether we're loading the Pokemon's types.
     */
    loadingPokemonTypes: boolean,

    /**
     * The Pokemon's base stat values.
     */
    baseStatValues: number[],

    /**
     * Whether we're loading the Pokemon's base stat values.
     */
    loadingBaseStatValues: boolean,

    /**
     * Whether to show the shiny sprite.
     */
    showShinySprite: boolean,

    /**
     * Whether to show the efficacy list.
     */
    showEfficacy: boolean
}

/**
 * Component for selecting a Pokemon and displaying information about it.
 */
export class PokemonPanel extends Component<PokemonPanelProps, PokemonPanelState> {
    constructor(props: any) {
        super(props)
        this.state = {
            pokemonId: 0,
            pokemonValidity: PokemonValidity.Invalid,
            pokemonName: "",
            loadingPokemonName: true,
            pokemonSpriteUrl: "",
            loadingPokemonSpriteUrl: true,
            pokemonShinySpriteUrl: "",
            loadingPokemonShinySpriteUrl: true,
            pokemonTypes: [],
            loadingPokemonTypes: true,
            baseStatValues: [],
            loadingBaseStatValues: true,
            showShinySprite: false,
            showEfficacy: false
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loadingPokemonName: false,
            loadingPokemonSpriteUrl: false,
            loadingPokemonShinySpriteUrl: false,
            loadingPokemonTypes: false,
            loadingBaseStatValues: false
        })
    }

    componentDidUpdate(previousProps: PokemonPanelProps) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let speciesId = this.state.pokemonId
            if (speciesId > 0) {
                this.fetchTypes(speciesId)
                this.fetchBaseStatValues(speciesId)
            }
        }
    }

    render() {
        // flags
        let showEfficacy = this.state.showEfficacy

        // sub-components
        let pokemonInfo = this.renderPokemonInfo()
        let efficacyList = this.renderEfficacyList()

        // handlers
        const setPokemon = (id: number, validity: PokemonValidity) => this.setSpecies(id, validity)
        const toggleIgnoreValidity = () => this.props.toggleIgnoreValidity()

        return (
            <div>
                <PokemonSelector
                    index={this.props.index}
                    versionGroupIndex={this.props.versionGroupIndex}
                    speciesNames={this.props.speciesNames}
                    ignoreValidity={this.props.ignoreValidity}
                    hideTooltips={this.props.ignoreValidity}
                    setPokemon={setPokemon}
                    toggleIgnoreValidity={toggleIgnoreValidity} />

                {pokemonInfo}

                <div className="flex margin-bottom">
                    <Button
                        className="margin-right"
                        color="primary"
                        onClick={() => this.toggleShowEfficacy()}>
                        {showEfficacy ? "Hide" : "Show"} efficacy
                    </Button>
                </div>

                <Collapse isOpen={showEfficacy}>
                    {efficacyList}
                </Collapse>
            </div>
        );
    }

    // returns the Pokemon info
    renderPokemonInfo() {
        return (
            <div className="flex margin-bottom">
                <div className="margin-right">
                    {this.renderPokemonSprite()}

                    {this.renderShinySpriteSwitch()}
                </div>

                <div className="margin-right">
                    {this.renderPokemonName()}

                    {this.renderPokemonTypes()}
                </div>

                {this.renderStatsGraph()}
            </div>
        )
    }

    // returns the Pokemon's sprite
    renderPokemonSprite() {
        let shouldShowSpecies = this.shouldShowSpecies()
        if (shouldShowSpecies && this.isLoading()) {
            return (
                <div className="sprite margin-bottom flex-center loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let spriteUrl = this.state.showShinySprite
                      ? this.state.pokemonShinySpriteUrl
                      : this.state.pokemonSpriteUrl
        return (
            <div className="sprite margin-bottom">
                <img
                    className={"inherit-size" + (shouldShowSpecies ? "" : " hidden")}
                    src={spriteUrl} />
            </div>
        )
    }

    // returns a switch that toggles between default and shiny sprites
    renderShinySpriteSwitch() {
        return (
            <FormGroup style={{ marginBottom: 0 }}>
                <CustomInput
                    type="switch"
                    id={"toggleShinySpriteSwitch" + this.props.index}
                    checked={this.state.showShinySprite}
                    label={this.state.showShinySprite ? "Shiny" : "Default"}
                    onChange={() => this.toggleShowShinySprite()} />
            </FormGroup>
        )
    }

    // returns the Pokemon's name
    renderPokemonName() {
        let shouldShowSpecies = this.shouldShowSpecies()
        if (shouldShowSpecies && this.isLoading()) {
            return (
                <div className="center-text margin-bottom loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        return (
            <div className={"center-text margin-bottom" + (shouldShowSpecies ? "" : " hidden")}>
                {this.state.pokemonName}
            </div>
        )
    }

    // returns the Pokemon's types
    renderPokemonTypes() {
        let shouldShowSpecies = this.shouldShowSpecies()
        if (shouldShowSpecies && this.isLoading()) {
            return (
                <div className="flex-center type-pair loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        return (
            <div className={"flex-center type-pair"}>
                {this.state.pokemonTypes.map((type, i) => {
                    return (
                        <div
                            key={i}
                            className="flex-center fill-parent">
                            <img
                                key={i}
                                className={"type-icon padded" + (shouldShowSpecies ? "" : " hidden")}
                                src={require(`../images/typeIcons/${type.toLowerCase()}.png`)} />
                        </div>
                    )
                })}
            </div>
        )
    }

    // returns a graph of the Pokemon's base stats
    renderStatsGraph() {
        let shouldShowSpecies = this.shouldShowSpecies()
        if (shouldShowSpecies && this.isLoading()) {
            return (
                <div className="stat-graph margin-right loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let className = shouldShowSpecies ? "" : "hidden";
        return (
            <div className="stat-graph margin-right">
                <div className="stat-names">
                    {this.props.baseStatNames.map((name, i) => {
                        return (
                            <div
                                key={i}
                                className={className}>
                                {name}
                            </div>
                        )
                    })}
                </div>

                <div className="stat-bars">
                    {this.state.baseStatValues.map((value, i) => {
                        return (
                            <div className="flex">
                                <div
                                    key={i}
                                    className={"stat-bar" + (shouldShowSpecies ? "" : " hidden")}
                                    style={{ width: value }} />

                                <div
                                    className={"stat-value" + (shouldShowSpecies ? "" : " hidden")}>
                                    {value}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        return (
            <EfficacyList
                index={this.props.index}
                speciesId={this.state.pokemonId}
                typeSet={this.props.typeSet}
                versionGroupIndex={this.props.versionGroupIndex}
                parentIsLoading={this.isLoading()}
                showMultipliers={this.shouldShowSpecies()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    // returns a loading spinner
    makeSpinner() {
        return <Spinner animation="border" />
    }

    // toggle the shiny sprite
    toggleShowShinySprite() {
        this.setState(previousState => ({
            showShinySprite: !previousState.showShinySprite
        }))
    }

    // toggle the efficacy panel
    toggleShowEfficacy() {
        this.setState(previousState => ({
            showEfficacy: !previousState.showEfficacy
        }))
    }

    // returns whether this component is loading
    isLoading() {
        return this.state.loadingPokemonName
            || this.state.loadingPokemonSpriteUrl
            || this.state.loadingPokemonTypes
            || this.state.loadingBaseStatValues
    }

    // returns true if we have a species
    hasSpecies() {
        return this.state.pokemonId > 0
    }

    // returns true if we are set to the last species
    hasLastSpecies() {
        return this.state.pokemonId >= this.props.speciesNames.length
    }

    // returns true if the species is valid
    speciesIsValid() {
        return this.state.pokemonValidity === PokemonValidity.Valid
    }

    // returns true if the species should be displayed
    shouldShowSpecies() {
        let shouldShowInvalidSpecies = this.props.ignoreValidity && this.hasSpecies()
        return shouldShowInvalidSpecies || this.speciesIsValid()
    }

    // set the species and its validity
    setSpecies(speciesId: number, validity: PokemonValidity) {
        this.setState({
            pokemonId: speciesId,
            pokemonValidity: validity
        })

        this.fetchPokemonName(speciesId)
        this.fetchSpriteUrl(speciesId)
        this.fetchShinySpriteUrl(speciesId)
        this.fetchTypes(speciesId)
        this.fetchBaseStatValues(speciesId)
    }

    // fetches the name of the species from PokemonController
    fetchPokemonName(speciesId: number) {
        console.log(`Panel ${this.props.index}: fetching name for species ${speciesId}...`)

        this.setState({ loadingPokemonName: true })

        // fetch name
        fetch(`pokemon/${speciesId}/name`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch name for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(pokemonName => this.setState({ pokemonName: pokemonName }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonName: false }))
    }

    // fetches the sprite of the species from PokemonController
    fetchSpriteUrl(speciesId: number) {
        console.log(`Panel ${this.props.index}: fetching sprite for species ${speciesId}...`)

        this.setState({ loadingPokemonSpriteUrl: true })

        // fetch sprite URL
        fetch(`pokemon/${speciesId}/sprite`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch sprite URL for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ pokemonSpriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonSpriteUrl: false }))
    }

    // fetches the shiny sprite of the species from PokemonController
    fetchShinySpriteUrl(speciesId: number) {
        console.log(`Panel ${this.props.index}: fetching shiny sprite for species ${speciesId}...`)

        this.setState({ loadingPokemonShinySpriteUrl: true })

        // fetch sprite URL
        fetch(`pokemon/${speciesId}/sprite/shiny`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch shiny sprite URL for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ pokemonShinySpriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonShinySpriteUrl: false }))
    }

    // fetches the types for the species from PokemonController
    fetchTypes(speciesId: number) {
        console.log(`Panel ${this.props.index}: fetching types for species ${speciesId}...`)

        this.setState({ loadingPokemonTypes: true })

        // fetch types description
        fetch(`pokemon/${speciesId}/types/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch types for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(types => this.setState({ pokemonTypes: types }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingPokemonTypes: false }))
    }

    // fetches the base stat values for the species from PokemonController
    fetchBaseStatValues(speciesId: number) {
        console.log(`Panel ${this.props.index}: fetching base stat values for species ${speciesId}...`)

        this.setState({ loadingBaseStatValues: true })

        // fetch base stat values
        fetch(`pokemon/${speciesId}/baseStats/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch base stat values for species ${speciesId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(baseStatValues => this.setState({ baseStatValues: baseStatValues }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingBaseStatValues: false }))
    }
}
