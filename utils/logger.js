import Constants from '../constants'
import { format, parse } from 'date-fns'
import RNFetchBlob from 'rn-fetch-blob'
import PathHelper from './path-helper'
// import DeviceInfo from 'react-native-device-info'
import {deviceInfo} from './device-info-service'
// import firebase from 'react-native-firebase'
import {auth} from '../services/AuthService'
import NavService from './navigation-service'
import { Api } from './Api'

export default class Logger {

    static lastFilePath = null

    static __cleanUpDate = null

    static __isSyncing = false

    static init() {
        Api.instance.interceptors.request.use( config => { 
            config.baseURL = Constants.serverUrl
            return config; 
        }, error => Promise.reject(error) );
        Api.instance.interceptors.request.use(function (req) {
            Logger.logRequest(req)
            return req
        });
        Api.instance.interceptors.response.use(function (resp) {
            Logger.logResponse(resp)
            return resp
        }, function (error) {
            // if(error?.response?.config?.url === "GetUserProfile.cmd") { // if token is expired
            //     auth.isAuthorized && auth.dropUser().then(() => NavService.resetAction('Login'));
            //     return error;
            // }
            Logger.logResponseError(error.response)
            return error;
        });
    }

    static getCurrentFileName = async () => {

        let fileName = Logger.lastFilePath || Logger.__getFileName(),
            found = false,
            fileIndex = 1

        let folderExists = await RNFetchBlob.fs.exists(Logger.__getLogsFolder())
        if (!folderExists)
            await RNFetchBlob.fs.mkdir(Logger.__getLogsFolder())

        do {
            let exists = await RNFetchBlob.fs.exists(fileName)
            if (!exists) {
                Logger.__createNewLogFile(fileName)
                Logger.lastFilePath = fileName
                found = true
            } else {
                let stats = await RNFetchBlob.fs.stat(fileName)
                if (stats.size < 1024 * 1024) {
                    Logger.lastFilePath = fileName
                    found = true
                } else {
                    fileName = Logger.__getFileName(fileIndex)
                }
            }
            fileIndex++
        } while (!found)
        return Logger.lastFilePath
    }

    static syncToServer = async() => {
        if (Logger.__isSyncing) return
        Logger.__isSyncing = true
        let filePath = await Logger.getCurrentFileName()
        let currentFileName = PathHelper.getFileName(filePath)
        let deviceId = await deviceInfo.getMACAddress()
        if(deviceId) {
            deviceId = deviceId.replace(/:/g, "")
        }
        let userId = auth.userId
        let commandUrl = PathHelper.combine(Constants.serverUrl, `api/log/UploadMobileAppLogFiles?deviceId=${deviceId}&userId=${userId}`)

        await RNFetchBlob.config({
            trusty: true
        }).fetch('POST', commandUrl, {
            'Content-Type': "text/plain"
        }, [{
            name: 'logFile',
            filename : currentFileName,
            type: "text/plain",
            data: RNFetchBlob.wrap(filePath)}]).then(
                (success) => {
                    Logger.__cleanUp()
                }
            ).catch(
                error => Logger.fetchError(`ErrorSyncToServer: ${error}`)
            ).finally(() => {
                Logger.__isSyncing = false
            })
    }

    static __convertDate(date) {
        return parse(format(date, 'MM-DD-YYYY'))
    }

    static __cleanUp = async () => {
        try {
            Logger.__cleanUpDate = Date.now()
            let logsExist = await RNFetchBlob.fs.exists(Logger.__getLogsFolder())
            if (logsExist) {
                let files = await RNFetchBlob.fs.lstat(Logger.__getLogsFolder())
                for (let i = 0; i < files.length; i++) {
                    let fname = files[i].filename
                    try {
                        await RNFetchBlob.fs.writeFile(files[i].path, '', 'utf8')
                    } catch (e) {
                        Logger.error(`__cleanUp: ${e.message}`)
                    }
                }
            }
        } catch (e) {
            Logger.error(e)
            Logger.__cleanUpDate = null
        }
    }

    static __createNewLogFile = async (fileName) => {

        let deviceId = await deviceInfo.getMACAddress()
        if(deviceId) {
            deviceId = deviceId.replace(/:/g, "")
        }
        const deviceInfoObj = {
            name: `${deviceInfo.getBrand()} ${deviceInfo.getDeviceId()}`,
            country: deviceInfo.getDeviceCountry(),
            manufacturer: deviceInfo.getManufacturer(),
            os: `${deviceInfo.getSystemName()} ${deviceInfo.getSystemVersion()}`,
            deviceID: deviceId,
            isEmulator: deviceInfo.isEmulator(),
            deviceType: deviceInfo.getDeviceType(),
            buildNumber: deviceInfo.getBuildNumber()
        }
        await RNFetchBlob.fs.writeFile(fileName, `${Logger.__getCurrentTime()} | [Init] | Device Info: ${JSON.stringify(deviceInfoObj)}`, 'utf8')
    }

    static __getLogsFolder() {
        return PathHelper.combine(RNFetchBlob.fs.dirs.SDCardApplicationDir, 'files', 'logs')
    }

    static dateFormat = 'MM-DD-YYYY'

    static __getFileName(fileIndex = 0) {
        let fileIndexStr = fileIndex > 0 ? `.[${fileIndex}]` : ''
        return PathHelper.combine(Logger.__getLogsFolder(), `${format(new Date(), Logger.dateFormat)}${fileIndexStr}.txt`)
    }

    static get logStorage() {
        return Logger.__logStorage
    }

    static __logStorage = []


    static __getCurrentTime() {
        return '\r\n' + format(new Date(), `${Logger.dateFormat} | HH:mm:ss.SSS`)
    }

    static __logFn = async (message, params) => {
        if (__DEV__) {
            if (params)
                console.log(message, params)
            else
                console.log(message)
        }
        let logObj = message,
            logMessage
        let time = Logger.__getCurrentTime()
        if (message.construstor !== String)
            logObj = JSON.stringify(message)
        if (params)
            logObj = message + ': ' + (params.construstor === String ? params : JSON.stringify(params))
        logMessage = `${time} | [LOG] | ${logObj}`
        // firebase.analytics().logEvent('log_event', {
        //     time: time,
        //     log_data: logObj
        // })
        let fileName = await Logger.getCurrentFileName()
        RNFetchBlob.fs.appendFile(fileName, logMessage)
        Logger.__logStorage.push(logMessage)
    }

    static __warnFn = async (message) => {
        if (__DEV__) {
            console.warn(message)
        }
        let time = Logger.__getCurrentTime()
        let warnObj = `${time} | [WARN] | ${message}`
        // firebase.analytics().logEvent('warn_event', {
        //     time: time,
        //     log_data: message
        // })
        let fileName = await Logger.getCurrentFileName()
        RNFetchBlob.fs.appendFile(fileName, warnObj)
        Logger.__logStorage.push(warnObj)
    }

    static __errorFn = async (e) => {
        if (__DEV__) {
            console.error(e)
        }

        let errObj = null
        if (e instanceof String)
            errObj = e
        else if (e instanceof Error)
            errObj = e.message + ': ' + JSON.stringify(e)
        else
            errObj = JSON.stringify(e)

        errObj = Logger.__getCurrentTime() + ' | [ERROR] | ' + errObj
        // firebase.crashlytics().log(errObj)
        let fileName = await Logger.getCurrentFileName()
        RNFetchBlob.fs.appendFile(fileName, errObj)
        Logger.__logStorage.push(errObj)
    }

    static log(message, params) {
        Logger.__logFn(message, params)
    }

    static logRequest({url, data}) {
        let params = JSON.stringify(data)
        Logger.log('[LOG_REQUEST]:', `command: ${url}, request: ${params}`)
    }

    static logResponse({status, data, config}) {
        let params = JSON.stringify(data)
        Logger.log('[LOG_RESPONSE]:', `command: ${config.url}, status: ${status}, response: ${params}`)
    }

    static logResponseError({status, data, config}) {
        Logger.log('[LOG_RESPONSE_ERROR]:', `command: ${config.url}, status: ${status}, response: ${data}`)
    }

    static fetchSuccess(commandUrl, params) {
        let data = JSON.stringify(params) || 'No data or params not specified'
        Logger.log('[SUCCESS_RESPONSE]:', `command: ${commandUrl}, data: ${data}`)
    }

    static fetchError(commandUrl, data) {
        Logger.log('[ERROR_RESPONSE]:', `command: ${commandUrl}, data: ${JSON.stringify(data)}`)
    }

    static warn(warnText) {
        if (Constants.isDebug) {
            Logger.__warnFn(warnText)
        }
    }

    static error(e) {
        Logger.__errorFn(e)
    }
}