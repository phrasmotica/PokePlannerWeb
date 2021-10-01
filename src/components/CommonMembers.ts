/**
 * Interface for an index member.
 */
export interface IHasIndex {
    /**
     * The index of this component.
     */
    index: number
}

/**
 * Interface for a hide tooltips flag member.
 */
export interface IHasHideTooltips {
    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Interface for a component that can be searched.
 */
export interface IHasSearch {
    /**
     * The search term.
     */
    searchTerm: string
}

/**
 * Interface for members shared by numerous components.
 */
export interface IHasCommon extends IHasIndex, IHasHideTooltips {
}
