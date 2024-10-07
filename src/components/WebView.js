import React, { Component } from 'react';

import { WebView } from 'react-native-webview'
import EStyleSheet from 'react-native-extended-stylesheet'

export default class WebViewUI extends Component {
    render() {
        let { html } = this.props;
        let bgColor = EStyleSheet.value('$primaryColor')
        return <WebView
                    {...this.props}
                    source={{html: html}}
                    style={bgColor}
                />
    }
}