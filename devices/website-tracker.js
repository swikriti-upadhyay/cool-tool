import SystemTracker from './system-tracker'
import WebSiteNavigateTrackerData from '../data/website-navigation-tracker-data'
import TrackingImageData from '../data/tracking-image-data'

export default class WebsiteTracker extends SystemTracker {
    navigationEvents = []

    startDataCollection(respondentId, questionId) {
        if (this.start(respondentId, questionId))
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
        let correctedNavigationEvents = this.navigationEvents.map(ne => {
            ne.time = ne.time - timeCorrection
            return ne
        }).filter(ne => ne.time <= responseElapsedMilliseconds)

        return {
            navigation: correctedNavigationEvents,
            length: (this.ellapsedMilliseconds - timeCorrection)}
    }

    navigationUpdate(navigationData) {
        if (!this.activated)
            return
        if (!navigationData.loading)
            this.navigationEvents.push(new WebSiteNavigateTrackerData(
                this.trackingTimeOffset,
                navigationData.url,
                navigationData.title
            ))
    }
}