import { PokemonEntry } from "../models/PokemonEntry"
import { PokemonFormEntry } from "../models/PokemonFormEntry"
import { PokemonSpeciesEntry } from "../models/PokemonSpeciesEntry"

/**
 * Helper functions for Pokemon-related calculations.
 */
export class PokemonHelper {
    /**
     * Returns the effective types of the Pokemon given its form.
     */
    static getEffectiveTypes(
        variety: PokemonEntry | undefined,
        form: PokemonFormEntry | undefined,
        versionGroupId: number | undefined
    ) {
        if (variety === undefined) {
            return []
        }

        if (versionGroupId === undefined) {
            throw new Error("Version group ID is undefined!")
        }

        let types = variety.getTypes(versionGroupId)

        if (form !== undefined) {
            let formTypes = form.getTypes(versionGroupId)
            if (formTypes.length > 0) {
                // use form-specific types if present
                types = formTypes
            }
        }

        return types
    }

    /**
     * Returns whether the Pokemon is valid given its form.
     */
    static pokemonIsValid(
        species: PokemonSpeciesEntry,
        form: PokemonFormEntry | undefined,
        versionGroupId: number | undefined
    ) {
        if (versionGroupId === undefined) {
            throw new Error("Version group ID is undefined!")
        }

        let pokemonIsValid = species.isValid(versionGroupId)
        if (form !== undefined && form.hasValidity()) {
            // can only obtain form if base species is obtainable
            pokemonIsValid = pokemonIsValid && form.isValid(versionGroupId)
        }

        return pokemonIsValid
    }
}