/**
 * Represents some data associated with a numeric ID.
 */
export class WithId<T> {
    /**
     * The ID.
     */
    id: number

    /**
     * The data.
     */
    data: T

    /**
     * Constructor.
     */
    constructor(id: number, data: T) {
        this.id = id
        this.data = data
    }
}