import React, { Component } from "react"
import { GoogleLogin } from "react-google-login"

interface ILoginProps {

}

interface ILoginState {
    /**
     * Whether the user is authenticated.
     */
    isAuthenticated: boolean

    /**
     * The user's auth token.
     */
    token: string | undefined

    /**
     * The user.
     */
    user: string | undefined
}

/**
 * Component for handling user logins.
 */
export class Login extends Component<ILoginProps, ILoginState> {
    constructor(props: ILoginProps) {
        super(props)
        this.state = {
            isAuthenticated: false,
            token: undefined,
            user: undefined
        }
    }

    render() {
        return (
            <GoogleLogin
                clientId="XXXXXXXXXX"
                buttonText="Login"
                onSuccess={this.googleResponse}
                onFailure={this.googleResponse}
            />
        )
    }

    /**
     * Callback for Google login.
     */
    googleResponse() {
        console.log("googleResponse")
    }
}