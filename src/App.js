import React, { Component } from "react"
import { Route } from "react-router"
import { Layout } from "./components/Layout"
import { TeamBuilder } from "./components/TeamBuilder/TeamBuilder"

import "./custom.css"
import "semantic-ui-css/semantic.min.css"

export default class App extends Component {
    static displayName = App.name

    render() {
        return (
            <Layout>
                <Route exact path="/" component={TeamBuilder} />
            </Layout>
        )
    }
}
