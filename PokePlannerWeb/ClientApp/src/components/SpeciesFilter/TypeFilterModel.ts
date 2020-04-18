/**
 * Class representing a filter for types.
 */
export class TypeFilterModel {
    /**
     * The filter IDs.
     */
    ids: number[]

    /**
     * Constructor.
     */
    constructor(ids?: number[]) {
        this.ids = ids ?? []
    }

    /**
     * Returns the number of IDs in the filter.
     */
    count() {
        return this.ids.length
    }

    /**
     * Returns the number of IDs in the filter.
     */
    isEmpty() {
        return this.count() <= 0
    }

    /**
     * Toggles the given ID in the filter and returns whether the ID is now present.
     */
    toggle(id: number) {
        let i = this.ids.indexOf(id)

        if (i >= 0 && this.count() <= 1) {
            // can't filter out everything
            return true
        }

        if (i < 0) {
            this.ids.push(id)
        }
        else {
            this.ids.splice(i, 1)
        }

        return i < 0
    }

    /**
     * Returns whether the given type IDs pass the filter.
     */
    passesFilter(ids: number[]) {
        let typeFilter = this.ids
        let intersection = ids.filter(i => typeFilter.includes(i))
        return typeFilter.length <= 0 || intersection.length > 0
    }

    /**
     * Returns an empty type filter.
     */
    static createEmpty() {
        return new TypeFilterModel()
    }
}