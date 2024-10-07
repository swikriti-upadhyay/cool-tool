import TrackingImageData from '../data/tracking-image-data'
import SystemTracker from './system-tracker'
import {TouchEventType} from '../data/touch-event-data'
import ScrollTrackerData from '../data/scroll-tracker-data'
import {questionType} from '../datacollection/question'

import Logger from '../utils/logger'


export default class MouseTracker extends SystemTracker {

    static mouseMoveTrackingInterval = 33

    imageData = null
    area = null

    scrollLeft = 0
    scrollTop = 0

    get lastMouseEvent() {
        if (this.touchesEvents.length < 1)
            return null
        return this.touchesEvents[this.touchesEvents.length - 1]
    }

    get lastScrollEvent() {
        if (this.scrollEvents.length < 1)
            return null
        return this.scrollEvents[this.scrollEvents.length - 1]
    }

    touchesEvents = []
    scrollEvents = []
    controlClickEvents = []

    startDataCollection(respondentId, questionData, screenData) {
        let {x1, x2, y1, y2} = {}
        this.screenData = screenData
        this.scale = this.screenData.scale
        if (questionData.questionType !== questionType.EyeTrackingWebsite && questionData.questionType !== questionType.App && questionData.questionType !== questionType.Prototype) {
            let trackingArea = questionData.area
            let compressionX = trackingArea.containerNaturalWidth / trackingArea.containerWidth,
                compressionY = trackingArea.containerNaturalHeight / trackingArea.containerHeight
            x1 = trackingArea.x1
            x2 = trackingArea.x2
            y1 = trackingArea.y1
            y2 = trackingArea.y2
            this.imageData = new TrackingImageData(compressionX, compressionY, this.scale)
            this.area = questionData.area
        } else {
            let screenHeight = this.screenData.screen.height * this.screenData.scale,
                screenWidth = this.screenData.screen.width * this.screenData.scale
            this.area = {
                containerLeft: 0,//this.screenData.screen.x * this.screenData.scale,
                containerTop: 0,//this.screenData.screen.y * this.screenData.scale,
                containerHeight: screenHeight,
                containerWidth: screenWidth,
                containerNaturalHeight: screenHeight,
                containerNaturalWidth: screenWidth,
                visiblePartHeight: 0,
                visiblePartWidth: 0
            }
        }

        if (this.start(respondentId, questionData.id, x1, y1, x2, y2))
            return Promise.resolve()
        else
            return Promise.reject('Already started')
    }

    stopDataCollection() {
        if (this.stop())
            return Promise.resolve()
        else
            return Promise.reject('Already stopped')
    }

    dataCollection(referenceDataCollectionStartTime, responseElapsedMilliseconds) {
        let timeCorrection = referenceDataCollectionStartTime - this.trackingStartTime

        let correctedTouchesEvents = this.touchesEvents.map(me => {
            me.t = me.t - timeCorrection
            return me
        }).filter(me => me.t >= 0 && me.t <= responseElapsedMilliseconds)

        let parsedTouches = MouseTracker.__parseRawMouseData(correctedTouchesEvents, responseElapsedMilliseconds)

        let correctedScrollEvents = this.scrollEvents.map(se => {
            se.time = se.time - timeCorrection
            return se
        }).filter(se => se.t >= 0 && se.time <= responseElapsedMilliseconds)

        let correctedClickEvents = this.controlClickEvents.map(ce => {
            ce.time = ce.time - timeCorrection
            return ce
        }).filter(ce => ce.t >= 0 && ce.time <= responseElapsedMilliseconds)

        let mouse = parsedTouches.filter(t => t.stop.t - t.start.t <= 250).map(t => {
            let click = {}
            Object.assign(click, t.start)
            click.et = 1
            return click
        })

        return {
            mouse: mouse,
            touches: parsedTouches,
            scroll: correctedScrollEvents,
            click: correctedClickEvents,
            area: this.area
        }
    }

    setScrollPosition(scrollLeft, scrollTop) {
        if (!this.activated)
            return
        const scrollData = new ScrollTrackerData(scrollLeft, scrollTop, this.trackingTimeOffset)
        this.scrollLeft = scrollData.l * this.scale
        this.scrollTop = scrollData.t * this.scale
        let __lastScrollEvent = this.lastScrollEvent
        if (__lastScrollEvent && __lastScrollEvent.equals(scrollData))
            return
        this.scrollEvents.push(scrollData)
    }

    controlClicked(rawClickData, topOffset) {
        if (!this.activated)
            return
        try {
            let clickData = JSON.parse(rawClickData[0])
            clickData.x = clickData.x * this.scale
            clickData.y = (clickData.y + topOffset) * this.scale
            clickData.time = this.trackingTimeOffset
            this.controlClickEvents.push(clickData)
        } catch (e) {
            Logger.warn(e)
        }
    }

    updateMouseData(rawMouseData) {
        if (!this.activated)
            return
        rawMouseData.x = rawMouseData.x * this.scale
        rawMouseData.y = rawMouseData.y * this.scale
        rawMouseData.t = this.trackingTimeOffset
        this.touchesEvents.push(rawMouseData)
    }

    static __toMouseDataObj(mouseData) {
        return {
            x: mouseData.x,
            y: mouseData.y,
            t: mouseData.t
        }
    }

    static ensureStartExists(mouseDataItem, dataInProcess, processedData) {
        if (!dataInProcess[mouseDataItem.id]) {
            Logger.warn('parse TouchStart: data don`t exist for identifier')
            let startItem = {}
            Object.assign(startItem, mouseDataItem)
            startItem.t = 0
            startItem.eventType = TouchEventType.TouchStart
            MouseTracker.__assignRawData(startItem, dataInProcess, processedData)
        }
    }

    static __assignRawData(mouseData, dataInProcess, processedData) {
        let mouseDataItem = {}
        Object.assign(mouseDataItem, mouseData)//so we can modify object without data loss
        switch (mouseDataItem.eventType) {
            case TouchEventType.TouchStart:
                if (dataInProcess[mouseDataItem.id])
                    Logger.warn('parse TouchStart: data already exist for identifier')
                else
                    dataInProcess[mouseDataItem.id] = {
                        start: MouseTracker.__toMouseDataObj(mouseDataItem),
                        moves: []
                    }
                break
            case TouchEventType.TouchStop:
            case TouchEventType.TouchCancel:
                MouseTracker.ensureStartExists(mouseDataItem, dataInProcess, processedData)
                if (mouseDataItem.eventType === TouchEventType.TouchStop)
                    dataInProcess[mouseDataItem.id].stop = MouseTracker.__toMouseDataObj(mouseDataItem)
                else
                    dataInProcess[mouseDataItem.id].cancel = MouseTracker.__toMouseDataObj(mouseDataItem)

                processedData.push(dataInProcess[mouseDataItem.id])
                delete dataInProcess[mouseDataItem.id]
                break
            case TouchEventType.TouchMove:
                MouseTracker.ensureStartExists(mouseDataItem, dataInProcess, processedData)
                dataInProcess[mouseDataItem.id].moves.push(MouseTracker.__toMouseDataObj(mouseDataItem))
                break
            default:
                Logger.warn('Unkonown data on mouse parse: ' + JSON.stringify(mouseDataItem))
        }
    }

    static __parseRawMouseData(mouseData, stopTime) {
        let processedData = []
        let dataInProcess = {}
        for (let i = 0; i < mouseData.length; i++) {
            MouseTracker.__assignRawData(mouseData[i], dataInProcess, processedData)
        }
        for (let prop in dataInProcess) {//if data collection stopped in during mouse event
            let incompletedEvent = dataInProcess[prop]
            let mouseData = null
            if (incompletedEvent.moves.length > 0)
                mouseData = incompletedEvent.moves[incompletedEvent.moves.length - 1]
            else
                mouseData = incompletedEvent.start
            let stopMouseData = {}
            Object.assign(stopMouseData, mouseData)
            stopMouseData.t = stopTime
            stopMouseData.id = prop
            MouseTracker.__assignRawData(stopMouseData, dataInProcess, processedData)
        }
        return processedData
    }
}