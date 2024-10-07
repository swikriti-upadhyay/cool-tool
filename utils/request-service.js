// import PathHelper from '../utils/path-helper';
import NetInfoService from '../utils/connectionInfo';
// import CommonHelper from '../utils/common-helper';
// import Constants from '../constants'
// class RequestService {
    // constructor() {
    //     this.defaultParams = {
    //         method: 'GET',
    //         url: null,
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'Accept':'application/json'
    //         },
    //         body: null,
    //         success: null,
    //         error: null
    //     }
    //     this.netInfoService = NetInfoService.instance
    //     this.fetchParams = null
    // }
    // async fetch(props) { // send({params})
    //     this.fetchParams = {...this.defaultParams, ...props}
    //     this.netInfoService.checkConnection.then((hasConnection) => hasConnection ? this.fetchHandler() : this.showError())
    // }
    // async checkInternet() {
    //     this.netInfoService.checkConnection.then((hasConnection) => {
    //         if (hasConnection) {
    //             return Promise.resolve(true)
    //         } else {
    //             this.showError()
    //             return Promise.resolve(false)
    //         }
    //     })
    // }
    // fetchHandler() {
    //     let {method, url, headers, body, success, error} = this.fetchParams,
    //         formBody = CommonHelper.convertObjectToUri(body),
    //         data = {
    //             method,
    //             headers,
    //             body: formBody
    //         },
    //         commandUrl = PathHelper.combine(Constants.serverUrl, url);
    //     try {
    //         let res = await fetch(commandUrl, data),
    //             json = await res.json();
    //         return Promise.resolve(json);
    //     } catch(e) {

    //     }
    // }
    // showError() {

    // }
// }

class RequestService {
    constructor() {
        this.defaultParams = {
            method: 'GET',
            url: null,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept':'application/json'
            },
            body: null,
            success: null,
            error: null
        }
        // this.netInfoService = NetInfoService.instance
        this.fetchParams = null
    }
    then(callback) {
        if (NetInfoService.instance.isConnected) {
            callback && callback()
        }
        return
    }
}

export default new RequestService()