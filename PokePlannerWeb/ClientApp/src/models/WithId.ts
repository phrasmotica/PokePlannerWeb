/**
 * Represents some data associated with a numeric ID.
 */
export interface WithId<T> {
    /**
     * The ID.
     */
    id: number

    /**
     * The data.
     */
    data: T
}