/**
 * Enum representing the validity of a Pokemon species.
 */
export enum SpeciesValidity {
    /**
     * The species is present in the current game version.
     */
    Valid,

    /**
     * The species exists bit is absent from the current game version.
     */
    Invalid,

    /**
     * The species does not exist.
     */
    Nonexistent
}