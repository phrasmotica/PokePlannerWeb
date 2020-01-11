import React, { Component } from "react"
import { Spinner, FormGroup, CustomInput } from "reactstrap"
import { Tabs, Tab } from "react-bootstrap"
import { EfficacyList } from "./EfficacyList"
import { PokemonSelector } from "./PokemonSelector"
import { StatGraph } from "./StatGraph"
import { CaptureLocations } from "./CaptureLocations"
import { PokemonValidity } from "../models/PokemonValidity"
import { TypeSet } from "../models/TypeSet"

import "../styles/types.scss"
import "./PokemonPanel.scss"
import "./TeamBuilder.scss"
import { IIndexProp, IVersionGroupProp, IHideTooltipsProp } from "./CommonProps"

interface IPokemonPanelProps extends IIndexProp, IVersionGroupProp, IHideTooltipsProp {
    /**
     * Whether Pokemon validity in the selected version group should be ignored.
     */
    ignoreValidity: boolean,

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

interface IPokemonPanelState {
    /**
     * The Pokemon ID.
     */
    pokemonId: number,

    /**
     * The ID of the Pokemon form.
     */
    formId: number,

    /**
     * Value describing the Pokemon validity.
     */
    pokemonValidity: PokemonValidity,

    /**
     * The Pokemon's name.
     */
    displayName: string,

    /**
     * Whether we're loading the Pokemon's name.
     */
    loadingDisplayName: boolean,

    /**
     * The URL of the Pokemon's sprite.
     */
    spriteUrl: string,

    /**
     * Whether we're loading the URL of the Pokemon's sprite.
     */
    loadingSpriteUrl: boolean,

    /**
     * The URL of the Pokemon's shiny sprite.
     */
    shinySpriteUrl: string,

    /**
     * Whether we're loading the URL of the Pokemon's shiny sprite.
     */
    loadingShinySpriteUrl: boolean,

    /**
     * The Pokemon's types.
     */
    typeNames: string[],

    /**
     * Whether we're loading the Pokemon's types.
     */
    loadingTypeNames: boolean,

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
    showShinySprite: boolean
}

/**
 * Component for selecting a Pokemon and displaying information about it.
 */
export class PokemonPanel extends Component<IPokemonPanelProps, IPokemonPanelState> {
    constructor(props: any) {
        super(props)
        this.state = {
            pokemonId: 0,
            formId: 0,
            pokemonValidity: PokemonValidity.Invalid,
            displayName: "",
            loadingDisplayName: true,
            spriteUrl: "",
            loadingSpriteUrl: true,
            shinySpriteUrl: "",
            loadingShinySpriteUrl: true,
            typeNames: [],
            loadingTypeNames: true,
            baseStatValues: [],
            loadingBaseStatValues: true,
            showShinySprite: false
        }
    }

    componentDidMount() {
        // finished loading
        this.setState({
            loadingDisplayName: false,
            loadingSpriteUrl: false,
            loadingShinySpriteUrl: false,
            loadingTypeNames: false,
            loadingBaseStatValues: false
        })
    }

    componentDidUpdate(previousProps: IPokemonPanelProps) {
        // refresh if the version group index changed
        let previousVersionGroupIndex = previousProps.versionGroupIndex
        let versionGroupIndex = this.props.versionGroupIndex
        let versionGroupChanged = versionGroupIndex !== previousVersionGroupIndex

        if (versionGroupChanged) {
            let pokemonId = this.state.pokemonId
            if (pokemonId > 0) {
                this.fetchTypes(pokemonId)
                this.fetchBaseStatValues(pokemonId)
            }
        }
    }

    render() {
        // handlers
        const setPokemon = (pokemonId: number, validity: PokemonValidity) => this.setPokemon(pokemonId, validity)
        const clearPokemon = () => this.clearPokemon()
        const setForm = (formId: number) => this.setForm(formId)
        const toggleIgnoreValidity = () => this.props.toggleIgnoreValidity()

        return (
            <div className="margin-right">
                <div className="flex">
                    <PokemonSelector
                        index={this.props.index}
                        versionGroupIndex={this.props.versionGroupIndex}
                        speciesNames={this.props.speciesNames}
                        ignoreValidity={this.props.ignoreValidity}
                        hideTooltips={this.props.ignoreValidity}
                        setPokemon={setPokemon}
                        clearPokemon={clearPokemon}
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
        );
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

    // returns the Pokemon's sprite
    renderPokemonSprite() {
        let shouldShowPokemon = this.shouldShowPokemon()
        if (shouldShowPokemon && this.isLoading()) {
            return (
                <div className="sprite margin-auto-horiz flex-center loading">
                    {this.makeSpinner()}
                </div>
            )
        }

        let spriteUrl = this.state.showShinySprite
                      ? this.state.shinySpriteUrl
                      : this.state.spriteUrl
        return (
            <div className="sprite margin-auto-horiz">
                <img
                    className={"inherit-size" + (shouldShowPokemon ? "" : " hidden")}
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

        return (
            <div className="center-text">
                {shouldShowPokemon ? this.state.displayName : "-"}
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

        return (
            <div className={"flex-center type-pair"}>
                {this.state.typeNames.map((type, i) => {
                    return (
                        <div
                            key={i}
                            className="flex-center fill-parent">
                            <img
                                key={i}
                                className={"type-icon padded" + (shouldShowPokemon ? "" : " hidden")}
                                src={require(`../images/typeIcons/${type.toLowerCase()}-small.png`)} />
                        </div>
                    )
                })}
            </div>
        )
    }

    // returns a graph of the Pokemon's base stats
    renderStatsGraph() {
        return (
            <StatGraph
                index={this.props.index}
                statNames={this.props.baseStatNames}
                statValues={this.state.baseStatValues}
                shouldShowStats={this.shouldShowPokemon()} />
        )
    }

    // returns the efficacy list
    renderEfficacyList() {
        return (
            <EfficacyList
                index={this.props.index}
                typeNames={this.state.typeNames}
                typeSet={this.props.typeSet}
                versionGroupIndex={this.props.versionGroupIndex}
                parentIsLoading={this.isLoading()}
                showMultipliers={this.shouldShowPokemon()}
                hideTooltips={this.props.hideTooltips} />
        )
    }

    // returns the capture locations
    renderCaptureLocations() {
        return (
            <CaptureLocations
                index={this.props.index}
                pokemonId={this.state.pokemonId}
                versionGroupIndex={this.props.versionGroupIndex}
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
            || this.state.loadingBaseStatValues
    }

    // returns true if we have a Pokemon
    hasPokemon() {
        return this.state.pokemonId > 0
    }

    // returns true if the Pokemon is valid
    pokemonIsValid() {
        return this.state.pokemonValidity === PokemonValidity.Valid
    }

    // returns true if the Pokemon should be displayed
    shouldShowPokemon() {
        let shouldShowInvalidPokemon = this.props.ignoreValidity && this.hasPokemon()
        return shouldShowInvalidPokemon || this.pokemonIsValid()
    }

    // set the Pokemon and its validity
    setPokemon(pokemonId: number, validity: PokemonValidity) {
        this.setState({
            pokemonId: pokemonId,
            pokemonValidity: validity
        })

        this.fetchName(pokemonId)
        this.fetchSpriteUrl(pokemonId)
        this.fetchShinySpriteUrl(pokemonId)
        this.fetchTypes(pokemonId)
        this.fetchBaseStatValues(pokemonId)
    }

    // remove all Pokemon data from this panel
    clearPokemon() {
        this.setState({
            pokemonId: 0,
            pokemonValidity: PokemonValidity.Invalid,
            displayName: "",
            spriteUrl: "",
            shinySpriteUrl: "",
            typeNames: [],
            baseStatValues: []
        })
    }

    // set the Pokemon form
    setForm(formId: number) {
        this.setState({ formId: formId })

        // fetch form-specific information
        this.fetchFormName(formId)
        this.fetchFormSpriteUrl(formId)
        this.fetchFormShinySpriteUrl(formId)
        this.fetchFormTypes(formId)
    }

    // fetches the name of the Pokemon from PokemonController
    fetchName(pokemonId: number) {
        console.log(`Panel ${this.props.index}: fetching name for Pokemon ${pokemonId}...`)

        this.setState({ loadingDisplayName: true })

        // fetch name
        fetch(`pokemon/${pokemonId}/name`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch name for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(pokemonName => this.setState({ displayName: pokemonName }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingDisplayName: false }))
    }

    // fetches the name of the Pokemon form from FormController
    fetchFormName(formId: number) {
        console.log(`Panel ${this.props.index}: fetching name for Pokemon form ${formId}...`)

        this.setState({ loadingDisplayName: true })

        // fetch name
        fetch(`form/${formId}/name`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch name for Pokemon form ${formId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(formName => this.setState({ displayName: formName }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingDisplayName: false }))
    }

    // fetches the sprite of the Pokemon from PokemonController
    fetchSpriteUrl(pokemonId: number) {
        console.log(`Panel ${this.props.index}: fetching sprite for Pokemon ${pokemonId}...`)

        this.setState({ loadingSpriteUrl: true })

        // fetch sprite URL
        fetch(`pokemon/${pokemonId}/sprite`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch sprite URL for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ spriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingSpriteUrl: false }))
    }

    // fetches the sprite of the Pokemon form from FormController
    fetchFormSpriteUrl(formId: number) {
        console.log(`Panel ${this.props.index}: fetching sprite for Pokemon form ${formId}...`)

        this.setState({ loadingSpriteUrl: true })

        // fetch sprite URL
        fetch(`form/${formId}/sprite`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch sprite URL for Pokemon form ${formId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ spriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingSpriteUrl: false }))
    }

    // fetches the shiny sprite of the Pokemon from PokemonController
    fetchShinySpriteUrl(pokemonId: number) {
        console.log(`Panel ${this.props.index}: fetching shiny sprite for Pokemon ${pokemonId}...`)

        this.setState({ loadingShinySpriteUrl: true })

        // fetch sprite URL
        fetch(`pokemon/${pokemonId}/sprite/shiny`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch shiny sprite URL for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ shinySpriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingShinySpriteUrl: false }))
    }

    // fetches the shiny sprite of the Pokemon form from PokemonController
    fetchFormShinySpriteUrl(formId: number) {
        console.log(`Panel ${this.props.index}: fetching shiny sprite for Pokemon form ${formId}...`)

        this.setState({ loadingShinySpriteUrl: true })

        // fetch sprite URL
        fetch(`form/${formId}/sprite/shiny`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch shiny sprite URL for Pokemon form ${formId} but failed with status ${response.status}!`)
            })
            .then(response => response.text())
            .then(spriteUrl => this.setState({ shinySpriteUrl: spriteUrl }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingShinySpriteUrl: false }))
    }

    // fetches the types for the Pokemon from PokemonController
    fetchTypes(pokemonId: number) {
        console.log(`Panel ${this.props.index}: fetching types for Pokemon ${pokemonId}...`)

        this.setState({ loadingTypeNames: true })

        // fetch types description
        fetch(`pokemon/${pokemonId}/types/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch types for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(types => this.setState({ typeNames: types }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypeNames: false }))
    }

    // fetches the types for the Pokemon form from FormController
    fetchFormTypes(formId: number) {
        console.log(`Panel ${this.props.index}: fetching types for Pokemon form ${formId}...`)

        this.setState({ loadingTypeNames: true })

        // fetch types description
        fetch(`form/${formId}/types/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch types for Pokemon form ${formId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(types => this.setState({ typeNames: types }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingTypeNames: false }))
    }

    // fetches the base stat values for the Pokemon from PokemonController
    fetchBaseStatValues(pokemonId: number) {
        console.log(`Panel ${this.props.index}: fetching base stat values for Pokemon ${pokemonId}...`)

        this.setState({ loadingBaseStatValues: true })

        // fetch base stat values
        fetch(`pokemon/${pokemonId}/baseStats/${this.props.versionGroupIndex}`)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response
                }

                throw new Error(`Panel ${this.props.index}: tried to fetch base stat values for Pokemon ${pokemonId} but failed with status ${response.status}!`)
            })
            .then(response => response.json())
            .then(baseStatValues => this.setState({ baseStatValues: baseStatValues }))
            .catch(error => console.log(error))
            .then(() => this.setState({ loadingBaseStatValues: false }))
    }
}
