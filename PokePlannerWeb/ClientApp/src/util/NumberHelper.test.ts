import { NumberHelper } from "./NumberHelper"

it("leaves a single interval alone", () => {
    let intervals = [
        { start: 1, end: 3 },
    ]

    let mergedIntervals = NumberHelper.mergeIntervals(intervals)
    expect(mergedIntervals).toEqual(intervals)
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