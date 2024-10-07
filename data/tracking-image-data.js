export default class TrackingImageData {
    compressionX = 0
    compressionY = 0
    systemDPI = 0
    constructor(compressionX, compressionY, systemDPI) {
        Object.assign(this, arguments)
    }
}