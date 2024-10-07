import React, {Component} from 'react'
import {
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Image,
    Animated,
    NativeEventEmitter,
    BackHandler
} from 'react-native'
import { WebView } from 'react-native-webview'
import Text from '../components/text-component'
import Icon from 'react-native-vector-icons/AntDesign'
import PulsateIco from '@components/PulsateView'
import Logger from '../../utils/logger'
import EStyleSheet from 'react-native-extended-stylesheet'

import * as Progress from 'react-native-progress'
import BaseRenderer from './base-renderer'
import CookieManager from 'react-native-cookies'
import Constants from '../../constants'
import format from 'date-fns/format'
import { observer } from 'mobx-react'
import {observe} from 'mobx'
import CommonHelper from '../../utils/common-helper'
import NLCommon from 'react-native-nl-common'

import Popup from '@components/common/TaskPopup'
import ServiceRunner from '../../ServiceExample'

const jsToInject = `;function main (history) {
    setTimeout(function() {
        if (document.querySelector('canvas')) {
            document.querySelector('canvas').style.transform = "translate3d(0,0,0)"
        }
        var promiseChain = Promise.resolve();

        var callbacks = {};

        var init = function () {
            const guid = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
            };

            window.webViewBridge = {
                send: function (targetFunc, data, success, error) {

                    var msgObj = {
                        targetFunc: targetFunc,
                        data: data || []
                    };

                    if (success || error) {
                        msgObj.msgId = guid();
                    }

                    var msg = JSON.stringify(msgObj);

                    promiseChain = promiseChain.then(function () {
                        return new Promise(function (resolve, reject) {
                            if (msgObj.msgId) {
                                callbacks[msgObj.msgId] = {
                                    onsuccess: success,
                                    onerror: error
                                };
                            }

                            window.ReactNativeWebView.postMessage(msg);

                            resolve();
                        });
                    }).catch(function (e) {
                        alert('rnBridge send failed ' + e.message);
                    });
                },
            };

            document.addEventListener('message', function (e) {
                try {
                    var message;
                    try {
                        message = JSON.parse(e.data);
                    } catch (err) {
                        alert("failed to parse message from react-native " + err);
                        return;
                    }
                    if (message.args && callbacks[message.msgId]) {
                        if (message.isSuccessful && callbacks[message.msgId].onsuccess) {
                            callbacks[message.msgId].onsuccess.apply(null, message.args);
                        } else if (!message.isSuccessful && callbacks[message.msgId].onerror) {
                            callbacks[message.msgId].onerror.apply(null, message.args);
                        }
                        delete callbacks[message.msgId];
                    } else if (message.neurolabproxy) {
                        try {
                            console.log('neurolabproxy: ' + message.neurolabproxy);
                            window.SurveyEngine.neuroLab.__driver[message.neurolabproxy].apply(window.SurveyEngine.neuroLab.__driver, message.args);
                        } catch (e) {
                            console.error('neurolabproxy error on invoke ' + message.neurolabproxy + ': ' + e);
                        }
                    }
                } catch (e) {
                    console.error('neurolabproxy: ' + e);
                }
            });
        };

        init();

        var wtSendScrollDataToApp = function (scrollLeft, scrollTop) {
            try {
                window.webViewBridge.send('setScrollPosition', [scrollLeft, scrollTop]);
            } catch (ex) { }
        };

        var wtSendClickDataToApp = function (data) {
            try {
                window.webViewBridge.send('controllClicked', [JSON.stringify(data)]);
            } catch (ex) { }
        };

        var wtSendNavigationToApp = function (data) {
            try {
                window.webViewBridge.send('navigationChanged', [data]);
            } catch (ex) { }
        };

        window.wtSendCustomDataToApp = function (data) {
            try {
                window.webViewBridge.send('pushCustomData', [JSON.stringify(data)]);
            } catch (ex) { }
        };

        var wtElementClicked = function (event) {
            var element = event.target;
            var data = {
                x: event.clientX,
                y: event.clientY,
                pos: {
                    l: element.offsetLeft,
                    t: element.offsetTop
                },
                size: {
                    w: element.offsetWidth,
                    h: element.offsetHeight
                }
            };
            wtSendClickDataToApp(data);
        };


        var wtAddClickHandler = function () {
            document.addEventListener("click", function (e) {
                try{
                    wtElementClicked(e);
                } catch (ex) {
                }
            });
        };

        var wtGetOffset = function (element) {
            var top = 0, left = 0;
            do {
                top += element.offsetTop || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);

            return {
                top: top,
                left: left
            };
        };

        window.onscroll = function () {
            try {
                wtSendScrollDataToApp(window.pageXOffset, window.pageYOffset);
            } catch(ex) { }
        };

        var pushState = history.pushState;
        var back = history.back;
        function updateNavState() {
            setTimeout(function () {
                try {
                    var href = window.location.href;
                    var data = {
                        url: href,
                        loading: false,
                        title: document.title
                    };
                    wtSendNavigationToApp(data);
                } catch (ex) {
                    window.webViewBridge.send('logError', ['JS error occurred']);
                }
            }, 100);
        };

        history.pushState = function(state) {
            updateNavState();
            return pushState.apply(history, arguments);
        };
        history.back = function() {
            updateNavState();
            return back.apply(history);
        };
        window.onpopstate = function() {
            updateNavState();
        };
        window.onhashchange = function() {
            updateNavState();
        };

        var originalonreadystatechange = document.onreadystatechange;
        document.onreadystatechange = function () {
            originalonreadystatechange && originalonreadystatechange();
            if (document.readyState == "complete") {
                wtSendScrollDataToApp(0, 0);
                wtAddClickHandler();
            }
        };

        /* disable goback and go forward*/
        var rx = /INPUT|SELECT|TEXTAREA/i;
        document.addEventListener("keydown", keyDownHandler, false);

        function keyDownHandler(e) {
            if (e.which == 8) { /* 8 == backspace */
                if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
                    console.log(e.preventDefault);
                    if (e.preventDefault)
                        e.preventDefault();
                    return false;
                }
            }
        }

        document.onerror = function (errorMsg, url, lineNumber) {
            window.webViewBridge.send('logError', ['JS error occured', 'Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber]);
        };

        document.onreadystatechange();
    }, 500)
};
main(window.history);
`

const AnimatedWebView = Animated.createAnimatedComponent(WebView);

@observer
export default class WebTest extends BaseRenderer {
    get className() { return 'WebTestRenderer' }

    constructor(props) {
        super(props)
        this.webView = {
            canGoBack: false,
            ref: null,
        }
        observe(this.surveyItem, change => {
            if (!props.withBar) {
                ServiceRunner.updateTimeout(format(change.newValue, 'mm:ss'))
            }
            if (change.newValue == 0) {
                this.hidePopup()
                NLCommon.disableFullScreen()
                ServiceRunner.stopService()
            }
        })
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        let eventEmitter  = new NativeEventEmitter(ServiceRunner);
        let stopEventSend = false;
        eventEmitter.addListener('btnClick', (event) => {
            if (!stopEventSend) {
                stopEventSend = true;
                this.finish()
            }
        }
        )
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    handleBackPress = () => {
        if (this.webView.canGoBack && this.webView.ref) {
            this.webView.ref.getNode().goBack();
            return true;
        }
    }

    // TODO: split to small components for better performance
    state = {
        webViewInstance: null,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        scriptToInject: null,
        displayUrl: null,
        currentUrl: null,
        isFinishVisisble: true,
        observableItem: this.surveyItem,
        showPopup: false,
        instruction: this.surveyItem.eyeTrackingWebSiteObjective && CommonHelper.replaceBRwithNewLine(this.surveyItem.eyeTrackingWebSiteObjective)
    }


    webViewLoadEnd(e) {
        if (this.props.onNavigationChanged)
            this.props.onNavigationChanged(e.nativeEvent)
    }

    goBack() {
        this.webView.goBack()
    }

    showPopup() {
        this.setState({
            showPopup: true
        })
    }

    goForward() {
        this.webView.goForward()
    }

    onNavigationStateChange(navState) {
        let domain = this.getDomain(navState.url)
        let targetUrl = this.processURL(navState.url)
        this.webView.canGoBack = navState.canGoBack;
        this.setState({
            isLoading: navState.loading,
            displayUrl: domain,
            currentUrl: targetUrl,
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward
        })
        // if (this.props.onNavigationChanged)
        //     this.props.onNavigationChanged(e)
    }

    onFinish() {
        this.finishBtn.disabled = true
        this.finish()
    }

    addProtocolToUrl(url, secure) {
        let targetUrl = url
        if ((url.indexOf('://') === -1)) {
            let protocol = secure ? 'https://' : 'http://'
            targetUrl = protocol + targetUrl
        }
        return targetUrl
    }

    onDisplayUrlSubmit() {
        const {displayUrl} = this.state
        let domain = this.getDomain(displayUrl)
        let targetUrl = this.processURL(displayUrl)
        Logger.log("Change site: " + targetUrl)
        this.setState({currentUrl: targetUrl, displayUrl: domain})
    }

    onDisplayUrlChange(text) {
        this.setState({
            displayUrl: text
        })
    }

    start() {
        return super.start()
            .then(() => CookieManager.clearAll())
            .then(() => {
                if (!this.props.withBar) {
                    ServiceRunner.startService({
                        text: this.surveyItem.eyeTrackingWebSiteObjective,
                        btn_text: this.props.t('continue_btn'),
                        timeout: 1
                    })
                    NLCommon.enableFullScreen()
                }
                this.screenWidth = Dimensions.get('screen').width
                let targetUrl = this.surveyItem.eyeTrackingWebSiteUrl || Constants.defaultTestSiteUrl
                const displayUrl = this.getDomain(targetUrl)
                targetUrl = this.processURL(targetUrl)
                Logger.log("Tested site: " + targetUrl)
                this.setState({currentUrl: targetUrl, displayUrl: displayUrl})
            })
    }

    finish() {
        return super.finish()
            .then(() => {
                if (!this.props.withBar) {
                    NLCommon.disableFullScreen()
                    ServiceRunner.stopService()
                }
                this.hidePopup()
            })
    }

    getDomain(url) {
        let subdomain = true;

        url = url.replace(/(https?:\/\/)?(www.)?/i, '');

        if (!subdomain) {
            url = url.split('.');

            url = url.slice(url.length - 2).join('.');
        }

        if (url.indexOf('/') !== -1) {
            return url.split('/')[0];
        }

        // url = this.addProtocolToUrl(url);

        return url;
    }

    isContainWWW(url) {
        return /www\./.test(url)
    }

    processURL(url, secure = true) {
        let subdomain = true;

        url = url.replace(/(https?:\/\/)/i, '');

        if (!subdomain) {
            url = url.split('.');

            url = url.slice(url.length - 2).join('.');
        }

        // if (!this.isContainWWW(url)) {
        //     url = `www.${url}`
        // }

        url = this.addProtocolToUrl(url, secure);

        return url;
    }

    onMessage(e) {
        if (this.props.onMessage)
            this.props.onMessage(e)
        else
            Logger.log(e.nativeEvent.data)
    }

    setHeaderHeight(height) {
        this.headerHeight = height
    }

    toggleFinishVisibility(state) {
        this.setState({
            isFinishVisisble: state
        })
    }

    _onFocus() {
        this.setState({
            displayUrl: this.state.currentUrl
        })
        this.toggleFinishVisibility(false)
    }

    _onBlur() {
        this.setState({
            displayUrl: this.getDomain(this.state.currentUrl)
        })
        this.toggleFinishVisibility(true)
    }

    renderPopup() {
        return (
            <Popup visible={this.state.showPopup} onHide={() => this.hidePopup()}>
                <Text>{this.state.instruction}</Text>
            </Popup>
        )
    }

    hidePopup() {
        this.setState({
            showPopup: false
        })
    }
    
    tryNonSecureUrl() {
        let targetUrl = this.processURL(this.state.currentUrl, false);
        this.setState({ currentUrl: targetUrl })
    }
    render() {
        const {t} = this.props;
        const {canGoBack, canGoForward, displayUrl, currentUrl, isLoading, observableItem} = this.state,
            timeLeftStr = format(observableItem.timeLeft, 'mm:ss')
        return <View style={styles.container}>
            {this.props.withBar && <View style={styles.webViewHeader} onLayout={(e) => this.setHeaderHeight(e.nativeEvent.layout.height)}>
                <PulsateIco
                    onPress={() => this.showPopup()}
                    name='infocirlce'
                    size={22}
                    color='#32C1E9'
                    delay={3000}
                />
                <TextInput
                    style={{flex: 0.7, fontSize: 14}}
                    value={displayUrl}
                    onChangeText={(text) => this.onDisplayUrlChange(text)}
                    onSubmitEditing={() => this.onDisplayUrlSubmit()}
                    onFocus={()=>this._onFocus()}
                    onBlur={()=>this._onBlur()}
                    blurOnSubmit={true}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    importantForAutofill='no'
                    autoCorrect={false}
                    keyboardType='url'
                    clearTextOnFocus={true}
                    returnKeyType='next'
                />
                <Text style={[observableItem.timeLeft <= 10000 ? {color: '#000'} : {color: '#ccc'}, { fontSize: 14 }]}>{timeLeftStr}</Text>
                <View style={[this.state.isFinishVisisble ? {opacity: 1}: {opacity: 0}]}>
                    <TouchableOpacity
                        style={styles.finishBtn}
                        onPress={() => this.onFinish()}
                        ref={(ref) => this.finishBtn = ref}
                        >
                        <Text style={styles.finishBtnText}>{t('finish_webview_btn')}</Text>
                    </TouchableOpacity>
                </View>
            </View>}
            {isLoading && <Progress.Bar 
                indeterminate={true} 
                height={1} 
                width={this.screenWidth} 
                borderWidth={0} 
                unfilledColor="gainsboro"
                color={EStyleSheet.value('$primaryColor')}/>}
            <AnimatedWebView
                javaScriptEnabledAndroid={true}
                injectedJavaScript={jsToInject}
                ref={webView => this.webView.ref = webView}
                onNavigationStateChange={(e) => this.onNavigationStateChange(e)}
                onShouldStartLoadWithRequest={request => {
                    // Only allow https:// & http://
                    let { url } = request;
                    return url.startsWith('https://') || url.startsWith('http://')
                }}
                onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    if (nativeEvent.code === -6) {
                        this.tryNonSecureUrl()
                    }
                }}
                onLoad={(e) => this.webViewLoadEnd(e)}
                source={{uri: currentUrl}}
                onMessage={(e) => this.onMessage(e)}
                originWhitelist={['*']}
                styles={styles.webView}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollY } } }], {
                    useNativeDriver: true
                })}
                dataDetectorTypes={'all'}
            />
            {this.renderPopup()}
        </View>
    }
}

const styles = EStyleSheet.create({
    bgPopup: {
        marginTop: -10,
        width: '100%',
        height: 140,
        resizeMode: 'contain'
    },
    footer: {
        height: 52,
        alignItems: 'center',
        flexDirection: 'row',
        // borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, .12)',
        paddingHorizontal: 4,
      },
      footerRight: {
          justifyContent: 'flex-end'
      },
      btn: {
        color: '#95BC3E',
        fontSize: 14,
        width: 75,
        fontWeight: 'bold',
        paddingVertical: 8,
        marginHorizontal: 4,
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
      },
    container: {
        flex: 1,
        backgroundColor: '$lightColor'
    },
    webViewHeader: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
        alignItems: 'center'
    },
    disabled: {
        opacity: .4
    },
    webView: {
        flex: 1
    },
    finishBtn: {
        // flex: 0.2, 
        backgroundColor: '$primaryColor', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    finishBtnText: {
        padding: 8, 
        color: '$lightColor', 
        fontSize: 14,
        fontWeight: 'bold'
    }
})