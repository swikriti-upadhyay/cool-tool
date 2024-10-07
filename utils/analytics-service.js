import Constants from '../constants'
import PathHelper from './path-helper'
import {deviceInfo} from '../utils/device-info-service'
import {Storages} from '../storage/data-storage-helper'
import { Api } from './Api'

class AnalyticsService {
    static __instance = null
    deviceData = {
        deviceId: "",
        deviceMake: "",
        deviceModel: "",
        osVersion: "",
        os: "android"
    }
    hasDeviceDataInit = false

    constructor() {
        if (!AnalyticsService.__instance) {
            AnalyticsService.__instance = this
        }

        return AnalyticsService.__instance
    }

    static get instance() {
        if (AnalyticsService.__instance === null)
            AnalyticsService.__instance = new AnalyticsService()
        return AnalyticsService.__instance
    }

    init() {
        let settingsStorage = Storages.SettingsStorage
        return settingsStorage.getSettings()
            .then((settings) => {
                if (!settings.isDeviceRegistered) {
                    this.deviceRegister().then((isDeviceRegistered) => {
                        settings.isDeviceRegistered = isDeviceRegistered
                        settingsStorage.update(settings)
                    })
                }
            })
    }

    get Os() {
        return "android"
    }

    async deviceRegister() {
        try {
            let deviceId = await deviceInfo.getMACAddress()
            let deviceMake = deviceInfo.getManufacturer()
            let deviceModel = deviceInfo.getModel()
            let osVersion = deviceInfo.getSystemVersion()
            let params = {
                deviceId,
                deviceMake,
                deviceModel,
                os: "android",
                osVersion
            }
            let response = await Api.formData("POST", "RegisterDeviceCommand.cmd", params)
            return Promise.resolve(!!response.data.res)
        } catch {
            return Promise.resolve(false)
        }
    }

    async connectUserToDevice() {
        try {
            let deviceId = await deviceInfo.getMACAddress()
            let params = {
                deviceId
            }
            let resp = await Api.formData("POST", "ConnectUserToDeviceCommand.cmd", params)
            return Promise.resolve(resp.data)
        } catch {
            return Promise.resolve(false)
        }
    }

    trackEvent(eventName, screen, payload = {}) {
        // Analytics.trackEvent(eventName, {
        //     ...payload,
        //     screen,
        //   });
    }
}

AnalyticsService = new AnalyticsService()

export { AnalyticsService }