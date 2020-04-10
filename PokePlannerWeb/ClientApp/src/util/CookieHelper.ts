import Cookies from "universal-cookie"

/**
 * Useful functions for managing cookies.
 */
export class CookieHelper {
    /**
     * Sets the cookie with the given name to the given value.
     */
    static set(name: string, value: any): void {
        let cookies = new Cookies()
        cookies.set(name, value, { path: "/" })
    }

    /**
     * Returns the cookie with the given name as a boolean, or false if not found.
     */
    static getFlag(name: string): boolean {
        let cookies = new Cookies()
        let cookie = cookies.get(name)
        if (cookie === undefined) {
            return false
        }

        return Boolean(JSON.parse(cookie))
    }

    /**
     * Returns the cookie with the given name as a number, or undefined if not found.
     */
    static getNumber(name: string): number | undefined {
        let cookies = new Cookies()
        let cookie = cookies.get(name)
        if (cookie === undefined) {
            return undefined
        }

        return Number(cookie)
    }

    /**
     * Returns the cookie with the given name as a number, or undefined if not found.
     */
    static get(name: string): string | undefined {
        let cookies = new Cookies()
        let cookie = cookies.get(name)
        if (cookie === undefined) {
            return undefined
        }

        return String(cookie)
    }

    /**
     * Removes the cookie with the given name.
     */
    static remove(name: string): void {
        let cookies = new Cookies()
        cookies.remove(name)
    }
}