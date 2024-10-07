import React, { Component } from "react";
import { WebView } from 'react-native-webview'
import EStyleSheet from 'react-native-extended-stylesheet'
import {
    View,
    Animated,
    BackHandler
} from 'react-native'

import NavigationService from '../../utils/navigation-service'
import {auth} from '../../services/AuthService'
import withStore from '../../store/withStore'
import Constants from '../../constants'

const INJECTED_JAVASCRIPT = `(function() {
    function wrap(fn) {
        return function wrapper() {
          var res = fn.apply(this, arguments);
          window.ReactNativeWebView.postMessage(window.location.href);
          return res;
        }
    }

    history.pushState = wrap(history.pushState);
    history.replaceState = wrap(history.replaceState);
    window.addEventListener('popstate', function() {
        window.ReactNativeWebView.postMessage(window.location.href);
    });

    window.wtSendPaymentStatus = function (status) {
        try {
            window.webViewBridge.send('onSendPaymentStatus', JSON.parse(status));
        } catch (ex) { }
    };
    window.webViewBridge = {
        send: function (targetFunc, data) {
            var msgObj = {
                targetFunc: targetFunc,
                data: data || []
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(msgObj));
        }
    };
})();`;

// const AnimatedWebView = Animated.createAnimatedComponent(WebView);

class Payment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            paymentUrl: `${Constants.paymentUrl}?token=${props.authToken}`,
            pageViewCount: 0
        }
        this.WEBVIEW_REF = React.createRef();
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this._backHandler);
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this._backHandler);
   }

    webViewLoadEnd(e) {
        //console.log(e)
    }

    onMessage({ nativeEvent: state }) {
        // if (this.state.paymentUrl !== state.data) {
        //     this.setState({
        //         pageViewCount: this.state.pageViewCount + 1
        //     })
        // }
        try {
            const requestData = JSON.parse(state.data)
            this[requestData.targetFunc].call(this, requestData.data)
        } catch {}
    }

    async onSuccess() {
        // add Loader
        await auth.updateCurrentSubscription()
        // close this page
        let callback = this.props.navigation.getParam('success')
        let popBack = this.props.navigation.getParam('count')
        NavigationService.pop(popBack)
        callback && callback()
    }

    updateSubscription() {
        auth.updateCurrentSubscription()
    }

    onSendPaymentStatus(status) {
        if (status) {
            this.onSuccess()
        }
    }

    _backHandler = () => {
        this.updateSubscription()
        // if (this.state.pageViewCount) {
        //     this.WEBVIEW_REF.current.goBack();
        //     this.setState({
        //         pageViewCount: this.state.pageViewCount - 1
        //     })
        //     return true;
        // } else {
        //     // if no routes - go back
        //     this.updateSubscription()
        //     return false;
        // }
    }

    _onNavigationStateChange = (navState) => {
        this.setState({
            backButtonEnabled: navState.canGoBack,
        });
    }

    render() {
        const { paymentUrl } = this.state
        return (
            <View style={styles.container}>
                <WebView
                    javaScriptEnabledAndroid={true}
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    ref={this.WEBVIEW_REF}
                    onLoadEnd={(e) => this.webViewLoadEnd(e)}
                    source={{uri: paymentUrl}}
                    onMessage={(e) => this.onMessage(e)}
                    originWhitelist={['*']}
                    styles={styles.webView}
                />
            </View>
        )
    }
}

export default withStore(Payment)

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '$lightColor'
    },
    webView: {
        flex: 1
    },
})