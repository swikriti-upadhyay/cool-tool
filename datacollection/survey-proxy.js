import React, {Component} from 'react'
import Logger from '../utils/logger'

const deviceStates = {
    Error: -1,
    Stopped: 0,
    Started: 1
}

const trackerDeviceType = {
    EyeTracker: 1,
    MindTracker: 2,
    Camera: 4,
    Mouse: 8,
    ScreenShot: 16
}

export default class SurveyProxy extends Component {

    logMessage(msg, params) {
        Logger.log(msg, params)
        return Promise.resolve()
    }

    logWarning(msg) {
        Logger.warn(msg)
        return Promise.resolve()
    }

    logError(msg, errorMsg) {
        Logger.error(new Error(`${msg || 'Error'}: ${errorMsg || 'No details'}`))
        return Promise.resolve()
    }

    controllClicked(...args) {
        // let offset = 0
        // if (this.state.showWebTesting && this.webTest) {
        //     offset = this.webTest.headerHeight
        //     console.log('offset:' + offset)
        // }
        // this.survey.mouseTracker.controlClicked(args, offset)
    }

    setScrollPosition(scrollLeft, scrollTop) {
        this.survey.mouseTracker.setScrollPosition(scrollLeft, scrollTop)
    }

    pushCustomData(data) {
        this.survey.customTracker.pushData(data.eventType, data);
    }

    onTouchEvent(eventType, eventData) {
        let rawObj = {
            eventType,
            x: eventData.pageX,
            y: eventData.pageY,
            id: eventData.identifier
        }
        this.survey.mouseTracker.updateMouseData(rawObj)
    }

    showNewInterviewPage() {
        this.props.navigation.navigate('Enter')
    }

    navigationChanged(e) {
        this.survey.websiteTracker.navigationUpdate(e)
    }

    onMessage(message) {
        let result = null,
            requestData = null
        try {
            requestData = JSON.parse(message.nativeEvent.data)
            let promise = this[requestData.targetFunc].apply(this, requestData.data)
            if (requestData.msgId) {
                promise
                    .then((data) => {
                        result = {
                            msgId: requestData.msgId,
                            isSuccessful: true,
                            args: [data] || []
                        }
                    })
                    .catch(e => {
                        Logger.error(requestData.targetFunc + ': ' + e.message)
                        result = {
                            msgId: requestData.msgId,
                            isSuccessful: false,
                            args: [{error: e.message}]
                        }
                        return Promise.resolve()
                    })
                    .then(() => {
                        this.postMessage(result)
                        return Promise.resolve()
                    })
            }
        } catch (e) {
            if (requestData && requestData.msgId) {
                result = {
                    msgId: requestData.msgId,
                    isSuccessful: false,
                    args: {error: e.message}
                }
            }
            if (result && result.msgId)
                this.postMessage(result)
        }
    }

    invokeNeuroLabProxy(fnName, args) {
        try {
            if (!fnName) {
                throw new Error('function name is not specified')
            }
            let data = {
                neurolabproxy: fnName,
                args: args || []
            }
            this.postMessage(data)
        } catch (e) {
            Logger.error(e)
        }
    }

    postMessage(data) {
        try {
            let msg = JSON.stringify(data)
            this.webView.postMessage(msg)
        } catch (e) {
            Logger.error(e)
        }
    }
}