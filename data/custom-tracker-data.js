export default class CustomTrackerData {
    data = {}
    time = Date.now()
    dataType = 'common'

    constructor(dataType, data, timeOffset) {
        if (dataType)
            this.dataType = dataType
        if (data)
            this.data = data
        if (timeOffset)
            this.time = timeOffset
    }
}