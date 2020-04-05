declare global {
    interface Array<T> {
        /**
         * Returns whether this array is componentwise equal to the other.
         */
        equals(this: Array<T>, other: Array<T>): boolean
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

export {}