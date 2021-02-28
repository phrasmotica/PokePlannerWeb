import { Interval, NumberHelper } from "./NumberHelper"

describe("mergeIntRanges()", () => {
    it("leaves a single range alone", () => {
        let ranges = [new Interval(1, 3)]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)
        expect(mergedRanges).toEqual(ranges)
    })

    it("merges neighbouring ranges correctly", () => {
        let ranges = [
            new Interval(1, 2),
            new Interval(3, 4),
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual([{ start: 1, end: 4 }])
    })

    it("merges overlapping ranges correctly", () => {
        let ranges = [
            new Interval(1, 3),
            new Interval(2, 4),
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual([{ start: 1, end: 4 }])
    })

    it("leaves distinct ranges alone", () => {
        let ranges = [
            new Interval(1, 2),
            new Interval(4, 5),
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual(ranges)
    })
})

describe("mergeIntervals()", () => {
    it("leaves a single interval alone", () => {
        let intervals = [new Interval(1, 3)]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)
        expect(mergedIntervals).toEqual(intervals)
    })

    it("merges neighbouring intervals correctly", () => {
        let intervals = [
            new Interval(1, 2),
            new Interval(2, 3),
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual([{ start: 1, end: 3 }])
    })

    it("merges overlapping intervals correctly", () => {
        let intervals = [
            new Interval(1, 3),
            new Interval(2, 4),
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual([{ start: 1, end: 4 }])
    })

    it("leaves distinct intervals alone", () => {
        let intervals = [
            new Interval(1, 2),
            new Interval(3, 4),
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual(intervals)
    })
})