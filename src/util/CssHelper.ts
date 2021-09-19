/**
 * Helper functions for creating CSS styles.
 */
export class CssHelper {
    /**
     * Returns a style object that sets the cursor to default if the given flag is true,
     * else the cursor is set to a pointer.
     */
    static defaultCursorIf(flag: boolean) {
        if (flag) {
            return { cursor: "default" }
        }

        return { cursor: "pointer" }
    }
}