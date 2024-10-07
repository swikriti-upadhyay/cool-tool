export default class SystemTracker {
    trackingStartTime = null
    trackingStopTime = null

    get trackingStartDateTime() {
        return new Date(this.trackingStartTime)
    }

    get trackingStopDateTime() {
        return new Date(this.trackingStartTime)
    }

    get ellapsedMilliseconds() {
        if (this.trackingStartTime && this.trackingStopTime)
            return this.trackingStopTime - this.trackingStartTime
        return 0
    }

    activated = false

    trackingX1 = 0
    trackingY1 = 0
    trackingX2 = 0
    trackingY2 = 0
    trackingWidth = 0
    trackingHeight = 0

    respondentId = 0
    questionId = 0

    get trackingTimeOffset() {
        return Date.now() - this.trackingStartTime
    }

    start(respondentId, questionId, trackingX1, trackingY1, trackingX2, trackingY2) {
        if (this.activated) {
            return false
        }
        this.activated = true

        this.trackingX1 = trackingX1
        this.trackingY1 = trackingY1
        this.trackingX2 = trackingX2
        this.trackingY2 = trackingY2

        this.trackingWidth = trackingX2 - trackingX1
        this.trackingHeight = trackingY2 - trackingY1

        this.respondentId = respondentId
        this.questionId = questionId

        this.trackingStartTime = Date.now()

        return true
    }

    stop() {
        if (!this.activated) {
            return false
        }
        this.trackingStopTime = Date.now()
        this.activated = false
        return true
    }
}