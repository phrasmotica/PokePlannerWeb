/**
 * Class representing an ID inclusion filter.
 */
export class IdFilterModel {
    /**
     * Whether the filter is enabled.
     */
    enabled: boolean

    /**
     * The filter IDs.
     */
    ids: number[]

    /**
     * Constructor.
     */
    constructor(enabled?: boolean, ids?: number[]) {
        this.enabled = enabled ?? false
        this.ids = ids ?? []
    }

    /**
     * Returns whether the filter is enabled.
     */
    isEnabled() {
        return this.enabled
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
     * Toggles the filter and returns whether it's now enabled.
     */
    toggle() {
        this.enabled = !this.enabled
        return this.enabled
    }

    /**
     * Toggles the given ID in the filter and returns whether the ID is now present.
     */
    toggleId(id: number) {
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
     * Returns whether the given IDs pass the filter.
     */
    passesFilter(ids: number[]) {
        return !this.isEnabled() || this.isInFilter(ids)
    }

    /**
     * Returns whether the given IDs pass the filter.
     */
    isInFilter(ids: number[]) {
        if (this.isEmpty()) {
            return true
        }

        let intersection = ids.filter(i => this.ids.includes(i))
        return intersection.length > 0
    }

    /**
     * Returns an empty filter.
     */
    static createEmpty() {
        return new IdFilterModel()
    }
}

/**
 * Class representing a filter for types.
 */
export class TypeFilterModel extends IdFilterModel {

}

/**
 * Class representing a filter for generations.
 */
export class GenerationFilterModel extends IdFilterModel {

}