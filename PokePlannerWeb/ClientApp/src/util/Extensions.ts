declare global {
    interface Array<T> {
        /**
         * Returns whether this array is componentwise equal to the other.
         */
        equals(this: Array<T>, other: Array<T>): boolean

        /**
         * Returns whether this array is componentwise greater than or equal to the other.
         */
        gte(this: Array<T>, other: Array<T>): boolean

        /**
         * Returns this array with one occurrence of each different element.
         */
        distinct(this: Array<T>): Array<T>
    }
}

Array.prototype.equals = function <T>(this: Array<T>, other: Array<T>) {
    if (this === other) {
        return true
    }

    if (this == null || other == null) {
        return false
    }

    if (this.length !== other.length) {
        return false
    }

    for (var i = 0; i < this.length; i++) {
        if (this[i] !== other[i]) {
            return false
        }
    }

    return true
}

Array.prototype.gte = function <T>(this: Array<T>, other: Array<T>) {
    if (this === other) {
        return false
    }

    if (this == null || other == null) {
        return false
    }

    if (this.length !== other.length) {
        return false
    }

    for (var i = 0; i < this.length; i++) {
        if (this[i] < other[i]) {
            return false
        }
    }

    return true
}

Array.prototype.distinct = function <T>(this: Array<T>) {
    return [...new Set(this)]
}

export {}