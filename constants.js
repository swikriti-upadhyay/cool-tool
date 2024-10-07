import {Storages} from './storage/data-storage-helper'
import Config from 'react-native-config';

export default class Constants {
    static init() {
        const __package = require('./package')
        return Storages.SettingsStorage.getSettings()
            .then((settings) => {
                Constants.serverUrl = JSON.parse(Config.CAN_EDIT_API) ? (settings.serverUrl || Constants.defaultServer) : Constants.defaultServer
                Constants.shakeDegree = settings.shakeDegree
                Constants.applicationName = settings.applicationName
                // Constants.applicationTask = settings.applicationTask
                Constants.__isDebug = settings.isDebug
                // Constants.defaultTestSiteUrl = settings.defaultTestSiteUrl
                Constants.version = __package.version
                return Promise.resolve()
            })
            .catch(() => {
                Constants.serverUrl = Constants.defaultServer
                Constants.version = __package.version
                return Promise.resolve()
            })
    }

    static get isDebug() {
        return __DEV__ || Constants.__isDebug
    }
    static __isDebug = false

    static serverUrl = null//'https://dev.2futureresearch.com/'

    static defaultTestSiteUrl = 'https://uxreality.com'

    static shakeDegree = '15'

    static skipCalibration = false

    static taskText = 'Please open website find the contact form and subscribe on weekly mailing'

    static applicationTask = "Recording is beginning Now open the app you want to test"

    static version = null

    static get demoVideoId() {
        return Config.DEMO_RECORDING_ID
    }

    static get defaultServer() {
        return Config.API_URL
    }

    static get paymentUrl() {
        return Config.PAYMENT_URL
    }

    static GP_URL = 'https://play.google.com/store/apps/details?id=com.uxreality'

    static DB_VERSION = 1

    static DefaultTime = 15

    static TestingTime = [
        {
            name: '15 seconds (test)',
            value: 15
        },
        {
            name: '1 minute',
            value: 60
        },
        {
            name: '2 minutes',
            value: 120
        },
        {
            name: '3 minutes',
            value: 180
        }
    ]

    static DeviceOrientation = [
        {
            name: 'Vertical',
            value: 'Vertical'
        },
        {
            name: 'Horizontal',
            value: 'Horizontal'
        }
    ]
}