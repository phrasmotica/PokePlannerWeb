import { EvolutionTrigger } from "./EvolutionTrigger"
import { Item } from "./Item"
import { Move } from "./Move"
import { Location } from "./Location"
import { PokemonSpecies } from "./PokemonSpecies"
import { Type } from "./Type"

/**
 * Represents a evolution chain in the data store.
 */
export class EvolutionChainEntry {
    /**
     * The ID of the evolution chain.
     */
    evolutionChainId: number

    /**
     * The evolution chain link.
     */
    chain: ChainLinkEntry

    /**
     * Constructor.
     */
    constructor(
        evolutionChainId: number,
        chain: ChainLinkEntry
    ) {
        this.evolutionChainId = evolutionChainId
        this.chain = chain
    }

    /**
     * Returns an evolution chain created from the given entry.
     */
    static from(evolutionChain: EvolutionChainEntry) {
        return new EvolutionChainEntry(
            evolutionChain.evolutionChainId,
            ChainLinkEntry.from(evolutionChain.chain)
        )
    }

    /**
     * Returns the IDs of the species in the chain.
     */
    getSpeciesIds(): number[] {
        return this.chain.getSpeciesIds()
    }
}

/**
 * Represents a link to a species as part of an evolution chain.
 */
export class ChainLinkEntry {
    /**
     * Whether this link is for a baby Pokemon. Only ever true on the base link.
     */
    isBaby: boolean

    /**
     * The Pokemon species at this stage of the evolution chain.
     */
    species: PokemonSpecies

    /**
     * All details regarding the specific details of the referenced species evolution.
     */
    evolutionDetails: EvolutionDetailEntry[]

    /**
     * A list of chain objects.
     */
    evolvesTo: ChainLinkEntry[]

    /**
     * Constructor.
     */
    constructor(
        isBaby: boolean,
        species: PokemonSpecies,
        evolutionDetails: EvolutionDetailEntry[],
        evolvesTo: ChainLinkEntry[]
    ) {
        this.isBaby = isBaby
        this.species = species
        this.evolutionDetails = evolutionDetails
        this.evolvesTo = evolvesTo
    }

    /**
     * Returns a chain link created from the given entry.
     */
    static from(chainLink: ChainLinkEntry): ChainLinkEntry {
        return new ChainLinkEntry(
            chainLink.isBaby,
            chainLink.species,
            chainLink.evolutionDetails,
            chainLink.evolvesTo.map(e => ChainLinkEntry.from(e))
        )
    }

    /**
     * Returns the IDs of the species in the chain.
     */
    getSpeciesIds(): number[] {
        if (this.evolvesTo.length <= 0) {
            return [this.species.id]
        }

        let nextSpeciesIds = this.evolvesTo.flatMap(e => e.getSpeciesIds())
        return [this.species.id, ...nextSpeciesIds]
    }
}

/**
 * Represents details of how a species evolves into another.
 */
export interface EvolutionDetailEntry {
    /**
     * The item required to cause evolution into this species.
     */
    item: Item

    /**
     * The type of event that triggers evolution into this species.
     */
    trigger: EvolutionTrigger

    /**
     * The ID of the gender of the evolving Pokémon species must be in order to evolve into this
     * species.
     */
    gender: number | null

    /**
     * The item the evolving species must be holding during the evolution trigger event to evolve
     * into this species.
     */
    heldItem: Item

    /**
     * The move that must be known by the evolving species during the evolution trigger event in
     * order to evolve into this species.
     */
    knownMove: Move

    /**
     * The evolving species must know a move with this type during the evolution trigger event in
     * order to evolve into this species.
     */
    knownMoveType: Type

    /**
     * The location the evolution must be triggered at.
     */
    location: Location

    /**
     * The minimum required level of the evolving Pokémon species to evolve into this species.
     */
    minLevel: number | null

    /**
     * The minimum required level of happiness the evolving species to evolve into this species.
     */
    minHappiness: number | null

    /**
     * The minimum required level of beauty the evolving species to evolve into this species.
     */
    minBeauty: number | null

    /**
     * The minimum required level of affection the evolving species to evolve into this species.
     */
    minAffection: number | null

    /**
     * Whether or not it must be raining in the overworld to cause evolution into this species.
     */
    needsOverworldRain: boolean

    /**
     * The species that must be in the players party in order for the evolving species to evolve
     * into this species.
     */
    partySpecies: PokemonSpecies

    /**
     * The type of Pokemon the player must have in their party during the evolution trigger event in
     * order for the evolving species to evolve into this species.
     */
    partyType: Type

    /**
     * The required relation between the Pokémon's Attack and Defense stats:
     * 1 means Attack > Defense
     * 0 means Attack = Defense
     * -1 means Attack < Defense
     */
    relativePhysicalStats: number | null

    /**
     * The required time of day: day or night.
     */
    timeOfDay: string | null

    /**
     * The species for which this one must be traded.
     */
    tradeSpecies: PokemonSpecies

    /**
     * Whether or not the 3DS needs to be turned upside-down as this Pokemon levels up.
     */
    turnUpsideDown: boolean
}