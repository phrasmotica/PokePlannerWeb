import { EvolutionTriggerEntry } from "./EvolutionTriggerEntry"
import { ItemEntry } from "./ItemEntry"
import { MoveEntry } from "./MoveEntry"
import { LocationEntry } from "./LocationEntry"
import { PokemonSpeciesEntry } from "./PokemonSpeciesEntry"
import { TypeEntry } from "./TypeEntry"

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

    /**
     * Returns the chain as an ordered list of links at each depth.
     */
    toDepthLists(): ChainLinkEntry[][] {
        return this.chain.toDepthLists()
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
    species: PokemonSpeciesEntry

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
        species: PokemonSpeciesEntry,
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
            PokemonSpeciesEntry.from(chainLink.species),
            chainLink.evolutionDetails.map(e => EvolutionDetailEntry.from(e)),
            chainLink.evolvesTo.map(e => ChainLinkEntry.from(e))
        )
    }

    /**
     * Returns the IDs of the species in the chain.
     */
    getSpeciesIds(): number[] {
        if (this.evolvesTo.length <= 0) {
            return [this.species.speciesId]
        }

        let nextSpeciesIds = this.evolvesTo.flatMap(e => e.getSpeciesIds())
        return [this.species.speciesId, ...nextSpeciesIds]
    }

    /**
     * Returns an ordered list of lists that each contain the chain links at a given depth.
     * More generally, this method flattens a tree into a list of nodes indexed by depth.
     */
    toDepthLists(): ChainLinkEntry[][] {
        let depthLists = []

        if (this.evolvesTo.length <= 0) {
            // empty tree
            return []
        }

        let linkQueue: ChainLinkEntry[] = [this]
        let numberOfLinksAtThisDepth = 0

        while (linkQueue.length > 0) {
            numberOfLinksAtThisDepth = linkQueue.length

            let depthList = []
            while (numberOfLinksAtThisDepth > 0) {
                let link = linkQueue.shift() // shift is O(n) but these lists are small
                depthList.push(link!)
                linkQueue.push(...link!.evolvesTo) // deal with this link's children next
                numberOfLinksAtThisDepth--
            }

            depthLists.push(depthList)
        }

        return depthLists
    }
}

/**
 * Represents details of how a species evolves into another.
 */
export class EvolutionDetailEntry {
    /**
     * The item required to cause evolution into this species.
     */
    item: ItemEntry | null

    /**
     * The type of event that triggers evolution into this species.
     */
    trigger: EvolutionTriggerEntry | null

    /**
     * The ID of the gender of the evolving Pokémon species must be in order to evolve into this
     * species.
     */
    gender: number | null

    /**
     * The item the evolving species must be holding during the evolution trigger event to evolve
     * into this species.
     */
    heldItem: ItemEntry | null

    /**
     * The move that must be known by the evolving species during the evolution trigger event in
     * order to evolve into this species.
     */
    knownMove: MoveEntry | null

    /**
     * The evolving species must know a move with this type during the evolution trigger event in
     * order to evolve into this species.
     */
    knownMoveType: TypeEntry | null

    /**
     * The location the evolution must be triggered at.
     */
    location: LocationEntry | null

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
    partySpecies: PokemonSpeciesEntry | null

    /**
     * The type of Pokemon the player must have in their party during the evolution trigger event in
     * order for the evolving species to evolve into this species.
     */
    partyType: TypeEntry | null

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
    tradeSpecies: PokemonSpeciesEntry | null

    /**
     * Whether or not the 3DS needs to be turned upside-down as this Pokemon levels up.
     */
    turnUpsideDown: boolean

    /**
     * Constructor.
     */
    constructor(
        item: ItemEntry | null,
        trigger: EvolutionTriggerEntry | null,
        gender: number | null,
        heldItem: ItemEntry | null,
        knownMove: MoveEntry | null,
        knownMoveType: TypeEntry | null,
        location: LocationEntry | null,
        minLevel: number | null,
        minHappiness: number | null,
        minBeauty: number | null,
        minAffection: number | null,
        needsOverworldRain: boolean,
        partySpecies: PokemonSpeciesEntry | null,
        partyType: TypeEntry | null,
        relativePhysicalStats: number | null,
        timeOfDay: string | null,
        tradeSpecies: PokemonSpeciesEntry | null,
        turnUpsideDown: boolean
    ) {
        this.item = item
        this.trigger = trigger
        this.gender = gender
        this.heldItem = heldItem
        this.knownMove = knownMove
        this.knownMoveType = knownMoveType
        this.location = location
        this.minLevel = minLevel
        this.minHappiness = minHappiness
        this.minBeauty = minBeauty
        this.minAffection = minAffection
        this.needsOverworldRain = needsOverworldRain
        this.partySpecies = partySpecies
        this.partyType = partyType
        this.relativePhysicalStats = relativePhysicalStats
        this.timeOfDay = timeOfDay
        this.tradeSpecies = tradeSpecies
        this.turnUpsideDown = turnUpsideDown
    }

    /**
     * Returns a chain link created from the given entry.
     */
    static from(chainLink: EvolutionDetailEntry) {
        let item = chainLink.item
        let trigger = chainLink.trigger
        let heldItem = chainLink.heldItem
        let knownMove = chainLink.knownMove
        let knownMoveType = chainLink.knownMoveType
        let location = chainLink.location
        let partySpecies = chainLink.partySpecies
        let partyType = chainLink.partyType
        let tradeSpecies = chainLink.tradeSpecies

        return new EvolutionDetailEntry(
            item === null ? null : ItemEntry.from(item),
            trigger === null ? null : EvolutionTriggerEntry.from(trigger),
            chainLink.gender,
            heldItem === null ? null : ItemEntry.from(heldItem),
            knownMove === null ? null : MoveEntry.from(knownMove),
            knownMoveType === null ? null : TypeEntry.from(knownMoveType),
            location === null ? null : LocationEntry.from(location),
            chainLink.minLevel,
            chainLink.minHappiness,
            chainLink.minBeauty,
            chainLink.minAffection,
            chainLink.needsOverworldRain,
            partySpecies === null ? null : PokemonSpeciesEntry.from(partySpecies),
            partyType === null ? null : TypeEntry.from(partyType),
            chainLink.relativePhysicalStats,
            chainLink.timeOfDay,
            tradeSpecies === null ? null : PokemonSpeciesEntry.from(tradeSpecies),
            chainLink.turnUpsideDown
        )
    }
}