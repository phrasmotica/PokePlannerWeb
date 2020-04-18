/**
 * Class representing a filter for a set of base stats.
 */
export class BaseStatFilterModel {
    /**
     * Whether the filter is enabled.
     */
    enabled: boolean

    /**
     * The filter values.
     */
    values: BaseStatFilterValue[]

    /**
     * Constructor.
     */
    constructor(enabled: boolean, values: BaseStatFilterValue[]) {
        this.enabled = enabled
        this.values = values
    }

    /**
     * Returns whether the filter is enabled.
     */
    isEnabled() {
        return this.enabled
    }

    /**
     * Toggles the filter and returns whether it's now enabled.
     */
    toggle() {
        this.enabled = !this.enabled
        return this.enabled
    }

    /**
     * Creates a filter set of a given length with empty values.
     */
    static createEmpty(count: number) {
        let values = []
        for (let i = 0; i < count; i++) {
            values.push(new BaseStatFilterValue(false, 0))
        }

        return new BaseStatFilterModel(false, values)
    }

    /**
     * Sets a new filter value at the given index.
     */
    toggleActive(index: number) {
        let isActive = this.values[index].active
        this.values[index].active = !isActive
    }

    /**
     * Sets a new filter value at the given index.
     */
    setValue(value: number, index: number) {
        this.values[index].value = value
    }

    /**
     * Returns whether the given base stats pass the filter.
     */
    passesFilter(stats: number[]) {
        if (!this.isEnabled()) {
            return true
        }

        let passValues = this.values.map((e, index) => !e.active || stats[index] >= e.value)
        return passValues.every(b => b)
    }
}

/**
 * Class representing a filter value for a base stat.
 */
export class BaseStatFilterValue {
    /**
     * Whether the filter is enabled.
     */
    active: boolean

    /**
     * The filter value.
     */
    value: number

    /**
     * Constructor.
     */
    constructor(active: boolean, value: number) {
        this.active = active
        this.value = value
    }
}