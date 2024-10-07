export default class OrientationTrackerData {
    o = null
    t = Date.now()

    constructor(orientation, timeOffset) {
        this.o = orientation
        this.t = timeOffset
    }
}