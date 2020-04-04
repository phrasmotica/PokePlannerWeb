import React, { Component } from 'react'
import { Route } from 'react-router'
import { Layout } from './components/Layout'
import { Login } from './components/Login'
import { TeamBuilder } from './components/TeamBuilder'

import './custom.css'

export default class App extends Component {
    static displayName = App.name

    render() {
        return (
            <Layout>
                <Route exact path="/" component={TeamBuilder} />
                <Route exact path="/login" component={Login} />
            </Layout>
        )
    }
}
