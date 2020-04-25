/**
 * Helper functions for number-related things.
 */
export class NumberHelper {
    /**
     * Merges the given intervals into a minimal spanning set.
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
 * Represents an interval of real numbers
 */
type Interval = { start: number, end: number }