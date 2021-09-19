import { NumberHelper } from "../util/NumberHelper"
import { PokemonSpeciesInfo } from "./swagger"

type PokedexDictionary = {
    pokedexId: number
    speciesInfo: PokemonSpeciesInfo[]
}[]

export class SpeciesInfo {
    speciesInfo: PokedexDictionary

    constructor(speciesInfo: PokedexDictionary) {
        this.speciesInfo = speciesInfo
    }

    getAllSpecies() {
        return this.speciesInfo.sort((a, b) => a.pokedexId - b.pokedexId)
                               .flatMap(a => a.speciesInfo)
    }

    getAllSpeciesIds() {
        return this.getAllSpecies().map(si => si.pokemonSpeciesId)
    }

    getById(id: number) {
        return this.getAllSpecies().find(si => si.pokemonSpeciesId === id)
    }

    getRandom() {
        let allSpecies = this.getAllSpecies()
        let max = allSpecies.length
        let randomIndex = NumberHelper.randomInt(0, max)
        return allSpecies[randomIndex]
    }

    clear() {
        this.speciesInfo = []
    }
}
