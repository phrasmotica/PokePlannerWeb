/**
 * Interface for an index prop.
 */
export interface IIndexProp {
    /**
     * The index of this component.
     */
    index: number
}

/**
 * Interface for a version group index prop.
 */
export interface IVersionGroupProp {
    /**
     * The index of the version group.
     */
    versionGroupIndex: number
}

/**
 * Interface for a parent loading flag prop.
 */
export interface IParentLoadingProp {
    /**
     * Whether the parent component is loading.
     */
    parentIsLoading: boolean
}

/**
 * Interface for a hide tooltips flag prop.
 */
export interface IHideTooltipsProp {
    /**
     * Whether tooltips should be hidden.
     */
    hideTooltips: boolean
}

/**
 * Interface for props shared by numerous components.
 */
export interface ICommonProps extends IIndexProp, IVersionGroupProp, IParentLoadingProp, IHideTooltipsProp {
}
