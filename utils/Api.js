// @flow
import axios from 'axios'
import timeoutFetch from './timeout-fetch'
import {
  rootStore
} from '../store/RootStore'
class Api {
  static __instance = null

  access_token = null;
  expires_in = null;
  token_type = null;
  instance = null;

  constructor() {
    if (!Api.__instance) {
      this.instance = axios.create({
        timeout: 10000 // 10 seconds
      });
      Api.__instance = this
    }

    return Api.__instance
  }


  /**
   *
   *
   * @param {string} method A request method
   * @param {string} endpoint Api endpoint
   * @param {*} body body Object
   * @param {*} headers Additional headers
   * @returns {Promise<any>}
   * @memberof Api
   */
  request(method: string, endpoint: string, body: any, headers: any): Promise < any > {
    return new Promise((res: any, rej: any) => {
      method = method.toLowerCase();
      let token = this.access_token ? this.access_token : rootStore.userStore.token
      if (this.instance === null) return
      this.instance({
          method,
          url: endpoint,
          headers: {
            "Authorization": "Bearer " + token,
            handlerEnabled: true, // Enable Logging request
            ...headers
          },
          data: body
        })
        .then((response) => {
          if (response.data.access_token) {
            this.access_token = response.data.access_token;
            this.expires_in = response.data.expires_in;
            this.token_type = response.data.token_type;
          }
          res(response);
        })
        .catch((e) => {
          rej(e);
        })
    })
  }

  /**
   * Send request using GET method
   * @param {string} endpoint Api url
   * @param {Object} data An data object send to the server.
   * @param {Object} headers An request headers.
   */
  get(endpoint: string, data: any, headers: any) {
    return this.request("GET", endpoint, data, headers);
  }

  /**
   * Send request using GET method
   * @param {string} endpoint Api url
   * @param {Object} data An data object send to the server.
   * @param {Object} [headers] An request headers.
   */
  post(endpoint: string, data: any, headers: any) {
    return this.request("POST", endpoint, data, headers);
  }

  /**
   * Send request using POST method
   * @param {string} endpoint Api url
   * @param {Object} data An data object send to the server.
   */
  postFormData(endpoint: string, data: any) {
    let formData = this.convertObjectToUri(data)
    return this.post(endpoint, formData, {
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  }

  /**
   * Send request with timeout
   * @param {Promise} requestPromise Request promise
   * @param {number} timeout Timeout number in milliseconds.
   */
  timeoutFetch(requestPromise: any, timeout: number = 15000) {
    return timeoutFetch(requestPromise, timeout)
  }
  /**
   * Convert object to formData and send request
   *
   * @param {string} method
   * @param {string} endpoint
   * @param {*} data
   * @param {*} headers
   * @returns {Promise<any>}
   * @memberof Api
   */
  formData(method: string, endpoint: string, data: any, headers: any): Promise < any > {
    let formData = this.convertObjectToUri(data)
    return this.request(method, endpoint, formData, headers)
  }
  /**
   * Update field object
   * @param {Object} data Object that represents field to update {${fieldId}___${fieldParam}: 'value'}.
   * @param {Object} [headers] An request headers.
   * @returns {Promise} Promise object represents result from server res: 1
   */
  updateObjectCommand(data: any, headers: any) {
    let formData = this.convertObjectToUri(data)
    return this.post("UpdateObjectCommand.cmd", formData, headers);
  }
  /**
   * Converts object to data uri
   *
   * @param {*} object
   * @returns {string} String represents uri
   * @memberof Api
   */
  convertObjectToUri(object: any) {
    let uri = [];
    for (var property in object) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(object[property]);
      uri.push(encodedKey + "=" + encodedValue);
    }
    uri = uri.join("&");
    return uri
  }
}
Api = new Api()

export {
  Api
}