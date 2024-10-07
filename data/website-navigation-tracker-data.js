export default class WebSiteNavigateTrackerData {
    time = Date.now()
    // url = null
    // loaded = false
    constructor(time, url, title) {
        this.time = time
        this.address = url
        this.title = title
    }
}