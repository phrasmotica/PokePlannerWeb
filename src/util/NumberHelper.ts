/**
 * Helper functions for number-related things.
 */
export class NumberHelper {
    /**
     * Merges the given integer intervals into a minimal spanning set of intervals.
     * Differs from mergeIntervals() s.t. [x, y] and [y + 1, z] are merged into [x, z].
     */
    static mergeIntRanges(ranges: Interval[]): Interval[] {
        if (ranges.length <= 1) {
            return ranges
        }

        let sortedRanges = ranges.sort((i1, i2) => i1.start - i2.start)

        let stack = [sortedRanges[0]]

        for (let i = 1; i < sortedRanges.length; i++) {
            let top = stack[stack.length - 1]
            let range = sortedRanges[i]

            //
            if (top.end < range.start - 1) {
                stack.push(range)
            }
            else if (top.end < range.end) {
                top.end = range.end
                stack.pop()
                stack.push(top)
            }
        }

        return stack
    }

    /**
     * Merges the given intervals into a minimal spanning set of intervals.
     */
    static mergeIntervals(intervals: Interval[]): Interval[] {
        if (intervals.length <= 1) {
            return intervals
        }

        let sortedIntervals = intervals.sort((i1, i2) => i1.start - i2.start)

        let stack = [sortedIntervals[0]]

        for (let i = 1; i < sortedIntervals.length; i++) {
            let top = stack[stack.length - 1]
            let interval = sortedIntervals[i]
            if (top.end < interval.start) {
                stack.push(interval)
            }
            else if (top.end < interval.end) {
                top.end = interval.end
                stack.pop()
                stack.push(top)
            }
        }

        return stack
    }
}

/**
 * Represents an interval of real numbers.
 */
export class Interval {
    /**
     * The start of the interval.
     */
    start: number

    /**
     * The end of the interval.
     */
    end: number

    /**
     * Constructor.
     */
    constructor(start = 0, end = 0) {
        this.start = start
        this.end = end
    }

    /**
     * Returns whether this interval is empty.
     */
    isEmpty() {
        return this.end === this.start
    }

    /**
     * Returns a string summarising this interval.
     */
    summarise() {
        if (this.end - this.start <= 0) {
            return `${this.start}`
        }

        return `${this.start} - ${this.end}`
    }
}