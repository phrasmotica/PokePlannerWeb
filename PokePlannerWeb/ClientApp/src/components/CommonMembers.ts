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
 * Interface for a version group index member.
 */
export interface IHasVersionGroup {
    /**
     * The index of the version group.
     */
    versionGroupId: number | undefined
}

/**
 * Interface for a parent loading flag member.
 */
export interface IHasParentLoading {
    /**
     * Whether the parent component is loading.
     */
    parentIsLoading: boolean
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
 * Interface for members shared by numerous components.
 */
export interface IHasCommon extends IHasIndex, IHasVersionGroup, IHasParentLoading, IHasHideTooltips {
}
