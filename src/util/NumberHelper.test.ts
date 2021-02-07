import { NumberHelper } from "./NumberHelper"

describe("mergeIntRanges()", () => {
    it("leaves a single range alone", () => {
        let ranges = [
            { start: 1, end: 3 },
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)
        expect(mergedRanges).toEqual(ranges)
    })

    it("merges neighbouring ranges correctly", () => {
        let ranges = [
            { start: 1, end: 2 },
            { start: 3, end: 4 },
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual([{ start: 1, end: 4 }])
    })

    it("merges overlapping ranges correctly", () => {
        let ranges = [
            { start: 1, end: 3 },
            { start: 2, end: 4 },
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual([{ start: 1, end: 4 }])
    })

    it("leaves distinct ranges alone", () => {
        let ranges = [
            { start: 1, end: 2 },
            { start: 4, end: 5 },
        ]

        let mergedRanges = NumberHelper.mergeIntRanges(ranges)

        expect(mergedRanges).toEqual(ranges)
    })
})

describe("mergeIntervals()", () => {
    it("leaves a single interval alone", () => {
        let intervals = [{ start: 1, end: 3 }]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)
        expect(mergedIntervals).toEqual(intervals)
    })

    it("merges neighbouring intervals correctly", () => {
        let intervals = [
            { start: 1, end: 2 },
            { start: 2, end: 3 },
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual([{ start: 1, end: 3 }])
    })

    it("merges overlapping intervals correctly", () => {
        let intervals = [
            { start: 1, end: 3 },
            { start: 2, end: 4 },
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual([{ start: 1, end: 4 }])
    })

    it("leaves distinct intervals alone", () => {
        let intervals = [
            { start: 1, end: 2 },
            { start: 3, end: 4 },
        ]

        let mergedIntervals = NumberHelper.mergeIntervals(intervals)

        expect(mergedIntervals).toEqual(intervals)
    })
})