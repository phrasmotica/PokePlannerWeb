/**
 * Enum representing the validity of a Pokemon.
 */
export enum PokemonValidity {
    /**
     * The Pokemon is present in the current game version.
     */
    Valid,

    /**
     * The Pokemon exists but is absent from the current game version.
     */
    Invalid,

    /**
     * The Pokemon does not exist.
     */
    Nonexistent
}