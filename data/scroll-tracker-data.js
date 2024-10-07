export default class ScrollTrackerData {
    l = 0
    t = 0
    time = Date.now()

    constructor(left, top, timeOffset) {
        this.l = left
        this.t = top
        this.time = timeOffset
    }

    equals(scrollData) {
        if (!scrollData)
            return false
        return this.l === scrollData.l && this.t === scrollData.t;
    }
}