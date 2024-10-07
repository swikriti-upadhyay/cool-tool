export default class SensorTrackerData {
    constructor(x, y, z, timeOffset) {
        this.x = Number(x).toFixed(3)
        this.y = Number(y).toFixed(3)
        this.z = Number(z).toFixed(3)
        this.t = timeOffset
    }
}