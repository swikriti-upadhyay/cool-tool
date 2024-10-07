import SystemTracker from './system-tracker'
import CustomTrackerData from '../data/custom-tracker-data'
import Logger from '../utils/logger'


export default class CustomTracker extends SystemTracker {

    customEvents = null

    startDataCollection(respondentId, questionData) {
        this.customEvents = []

        if (this.start(respondentId, questionData.id))
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

        let correctedCustomEvents = this.customEvents.map(me => {
            me.time = me.time - timeCorrection
            return me
        }).filter(me => me.time >= 0 && me.time <= responseElapsedMilliseconds)

        return correctedCustomEvents
    }

    pushData(eventType, data) {
        if (!this.activated)
            return
        const customData = new CustomTrackerData(eventType, data, this.trackingTimeOffset)
        this.customEvents.push(customData)
    }
}