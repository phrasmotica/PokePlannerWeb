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

    clear() {
        this.speciesInfo = []
    }
}
