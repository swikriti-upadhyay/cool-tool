import React, { Component } from 'react'
import PageView from '@components/common/PageView'

export default class AboutScreen extends Component {

    render() {
        return <PageView
            uri="https://www.uxreality.com/about"
            heading="About Us" />
    }
}