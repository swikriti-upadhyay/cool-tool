import {
    action,
    observable,
    transaction,
    computed,
    observe
} from 'mobx'
import {
    Storages,
    DataEntryType,
    DataType,
    SyncStatus
} from '../storage/data-storage-helper'
import i18n from '../utils/i18n';
import PathHelper from '../utils/path-helper'
import RNFetchBlob from 'rn-fetch-blob'
import * as mime from 'react-native-mime-types'
import Logger from '../utils/logger'
import Constants from '../constants'
import NetInfoService from '../utils/connectionInfo'
import pRetry, {
    AbortError
} from '../libs/pRetry'
import 'abortcontroller-polyfill'
import BackgroundTimer from 'react-native-background-timer'
import trackerType from '../datacollection/tracker-type'
import timeoutFetch from '../utils/timeout-fetch'
import AppStateService from '../utils/app-state-service'
import EStyleSheet from 'react-native-extended-stylesheet'
import PushNotification from 'react-native-push-notification'

const AbortController = window.AbortController

const AbortErrorName = 'AbortError'
const CanceledErrorName = 'Canceled'
const NoInternetErrorName = 'No internet access'

const getNoInternetError = () => {
    return new Error(i18n.t('no_internet'))
}

export const UploadState = {
    Waiting: 0,
    InProgress: 1,
    Finished: 2,
    Canceled: 3,
    Error: 4
}

export default class DataUploader {
    static getInstance() {
        if (DataUploader.instance == null) {
            DataUploader.instance = new DataUploader()
        }
        return DataUploader.instance
    }

    constructor() {
        this.uploadPromise = Promise.resolve()
        this.controller = null
        this.currentFetchBlobTask = null
        this.cancelIntervalId = null
        this.validateTimer = null
        this.tries = 0
        this.currentTotalSize = 0
        this.tempUpload = 0
        this.isSyncingMediaFiles = false
        // observe(DataUploader.getInstance(), change => {
        //     if (change.name == "isNeverAsk" && change.newValue) {
        //         return
        //     }
        //     if (change.newValue) { // finished
        //         hideMessage()
        //         this.finish()
        //     }
        // })
    }
    

    @observable generalSize = 1
    @observable totalUploadPercentage = 0
    @observable currentUploadPercentage = 0
    @observable currentJob = null
    @observable currentStep = 0
    @observable cancelAll = false
    @observable respsToSyncKeys = []
    @observable respsToSync = new Map()

    
    @computed get isRunning() {
        return this.respsToSyncKeys.length > 0
    }

    __isCancelling(respId) {
        if (this.cancelAll)
            return true
        const currentObj = this.respsToSync.get(respId)
        if (currentObj)
            return currentObj.state === UploadState.Canceled
        return false
    }

    async __dataUploaded(addtionalPrams) {
        let requestUri = PathHelper.combine(Constants.serverUrl, 'DataUploaded.ashx')
        try {
            let formData = new FormData()
            for (let key in addtionalPrams)
                formData.append(key, addtionalPrams[key])
            let res = await timeoutFetch(fetch(requestUri, {
                method: 'POST',
                body: formData
            }), 15000)
            res = await res.json()
            if (res.res !== '1') {
                Logger.fetchError(requestUri, addtionalPrams)
                throw new Error('Unable to mark data as uploaded. Error code: ' + res.res)
            }
            Logger.fetchSuccess(requestUri, addtionalPrams)
            return res
        } catch {
            Logger.fetchError(requestUri, addtionalPrams)
        }
    }

    async __getUploadToken(filename, addtionalPrams, mimeTypeRequired = false) {
        let requestUri = PathHelper.combine(Constants.serverUrl, 'GetUploadTokens.ashx')
        addtionalPrams.files = filename
        let formData = new FormData()
        for (let key in addtionalPrams)
            formData.append(key, addtionalPrams[key])
        if (mimeTypeRequired)
            formData.append('ignoreMimeType', 'false')
        try {
            let res = await timeoutFetch(fetch(requestUri, {
                method: 'POST',
                body: formData,
                signal: this.controller.signal
            }), 15000)
            let tokenData = await res.json()
            Logger.fetchSuccess(requestUri, addtionalPrams)
            return tokenData
        } catch(e) {
            Logger.fetchError(requestUri, e)
        }
    }

    async __uploadFile(currentFile, additionalData, respId) {
        let currentFileName = PathHelper.getFileName(currentFile)
        let totalNumber = 0,
            writtenNumber = 0
        let uploadFn = async () => {
            try {
                let result = await this.__getUploadToken(currentFileName, additionalData, true)
                if (!result.res || result.res.toString() !== '1')
                    throw new Error(result.errormessage)

                let currentFileUploadUrl = result.files.filter(f => f.OriginalFileName === currentFileName)[0].UploadUrl,
                    mimeType = mime.lookup(currentFileName)
                const startTime = (new Date()).getTime();
                let file = RNFetchBlob.wrap(currentFile)
                this.currentFetchBlobTask = RNFetchBlob.config({
                        trusty: true
                    })
                    .fetch('PUT', currentFileUploadUrl, {
                        'Content-Type': mimeType
                    }, file)

                let res = await this.currentFetchBlobTask
                    .uploadProgress((written, total) => {
                        totalNumber = Number(total);
                        writtenNumber = Number(written);
                        if (!this.currentTotalSize) this.currentTotalSize = totalNumber
                        if(this.isSyncingMediaFiles) {
                            this.totalUploadPercentage = parseInt(((this.tempUpload + writtenNumber) / this.generalSize) * 100)
                        }
                        this.currentUploadPercentage = Number((writtenNumber / totalNumber).toFixed(2))
                    })
                let response = await res.text()
                if(this.isSyncingMediaFiles) {
                    this.tempUpload += totalNumber
                }
                if (response && response.length > 0) {
                    Logger.error(response)
                    return Promise.reject('File uploading error')
                }
                const endTime = (new Date()).getTime();
                const duration = (endTime - startTime) / 1000;
                const speed = ((this.currentTotalSize / Math.pow(10, 6)) / duration) * 8
                let uploadUrl = currentFileUploadUrl.substring(0, currentFileUploadUrl.lastIndexOf('?'))
                Logger.log(`Upload speed: ${speed.toFixed(2)} MB/s`)
                return uploadUrl
            } catch (e) {
                if (!NetInfoService.instance.isConnected)
                    throw new AbortError(new Error(i18n.t('no_internet')))
                else if (this.__isCancelling(respId) || e.name === AbortErrorName || e.message === CanceledErrorName)
                    throw new AbortError()
                throw new Error(`Can't upload file ${currentFileName}`)
            }
        }
        let url = await pRetry(uploadFn, {
            onFailedAttempt: (error) => {
                Logger.warn(`__uploadFile: ${error.message}`)
                Logger.warn(`__uploadFile attempt ${error.attemptNumber} failed. There are ${error.attemptsLeft} attempts left.`)
            },
            retries: 3
        })
        return url
    }

    async __uploadJsonDataAsFile(data, fileName, additionalData, respId) {
        let uploadFn = async () => {
            try {
                let result = await this.__getUploadToken(fileName, additionalData, true)
                if (!result.res || result.res.toString() !== '1')
                    throw new Error(result.errormessage)

                let currentFileUploadUrl = result.files.filter(f => f.OriginalFileName === fileName)[0].UploadUrl,
                    mimeType = mime.lookup(fileName)

                let res = await timeoutFetch(fetch(currentFileUploadUrl, {
                    method: 'PUT',
                    'Content-Type': mimeType,
                    body: new Blob([JSON.stringify(data)], {
                        type: mimeType
                    })
                }), 15000)
                let response = await res.text()
                Logger.fetchSuccess(currentFileUploadUrl, additionalData);
                if (response && response.length > 0) {
                    Logger.error(response)
                    throw new Error('File uploading error')
                }
                return currentFileUploadUrl.substring(0, currentFileUploadUrl.lastIndexOf('?'))
            } catch (e) {
                if (!NetInfoService.instance.isConnected)
                    throw new AbortError(new Error(i18n.t('no_internet')))
                else if (this.__isCancelling(respId) || e.name === AbortErrorName || e.message === CanceledErrorName)
                    throw new AbortError()
                throw new Error(`Can't upload json data file ${fileName}. Error: ${e}`)
            }
        }
        let url = await pRetry(uploadFn, {
            onFailedAttempt: (error) => {
                Logger.warn(`__uploadJsonDataAsFile: ${error.message}`)
                Logger.warn(`__uploadJsonDataAsFile attempt ${error.attemptNumber} failed. There are ${error.attemptsLeft} attempts left.`)
            },
            retries: 3
        })
        return url
    }

    async __uploadDataEntry(dataEntry, calibrationInfo) {
        this.currentUploadPercentage = 0
        try {
            let additionalData = {}
            if (dataEntry.entryType === DataEntryType.RESPONSEDATA) {
                additionalData = {
                    questionid: dataEntry.questionId,
                    respondentid: dataEntry.respondentId,
                    dataType: 'responseData'
                }
                if (dataEntry.dataType === DataType.SCREENSHOTS) {
                    additionalData.screenShotTracker = true
                } else if (dataEntry.dataType === DataType.CAMERA) {
                    additionalData.webcamTracker = true
                } else {
                    throw new Error('Unknown data type')
                }
            } else if (dataEntry.entryType === DataEntryType.CALIBRATION) {
                additionalData = {
                    questionid: dataEntry.questionId,
                    respondentid: dataEntry.respondentId,
                    dataType: 'responseData',
                    webEyeTracker: true
                }
            } else {
                throw new Error('Not implemented')
            }

            let entryAdditionalData = {}
            if (dataEntry.additionalData)
                entryAdditionalData = JSON.parse(dataEntry.additionalData)

            let uploadUrl = null,
                indexLink = null,
                calibrationInfoLink = null,
                trackingInfoLink = null,
                jobInfoLink = null,
                webviewDataLink = null
            uploadUrl = await this.__uploadFile(dataEntry.path, additionalData, dataEntry.respondentId)

            if (dataEntry.entryType === DataEntryType.RESPONSEDATA) {
                if (entryAdditionalData.data) {
                    webviewDataLink = await this.__uploadJsonDataAsFile(entryAdditionalData.data, 'data.json', additionalData, dataEntry.respondentId)
                }
                if (entryAdditionalData.index) {
                    indexLink = await this.__uploadJsonDataAsFile(entryAdditionalData.index, 'index.json', additionalData, dataEntry.respondentId)
                }
            } else if (dataEntry.entryType === DataEntryType.CALIBRATION) {
                let {
                    screenData,
                    calibrationData,
                    sensorsData
                } = entryAdditionalData.data,
                    sSize = [screenData.screen.width * screenData.scale, screenData.screen.height * screenData.scale],
                    sPosition = {
                        window_x: 0,
                        window_y: screenData.window.y * screenData.scale,
                        window_width: screenData.window.width * screenData.scale,
                        window_height: screenData.window.height * screenData.scale
                    }
                let calData = {
                    commands: [{
                        'type': 'set_calibration_data',
                        'value': calibrationData
                    }],
                    frames: [],
                    mode: 'calibration',
                    screen_size: sSize,
                    window_rect: sPosition,
                    sensors: sensorsData
                }
                calibrationInfoLink = await this.__uploadJsonDataAsFile(calData, `calibration_${Date.now()}.json`, additionalData)
            }

            if (dataEntry.entryType === DataEntryType.RESPONSEDATA &&
                dataEntry.dataType === DataType.CAMERA &&
                entryAdditionalData.data.neurolabTrackers & trackerType.Eye === trackerType.Eye) {
                let {
                    screenData
                } = calibrationInfo,
                sSize = [screenData.screen.width * screenData.scale, screenData.screen.height * screenData.scale],
                    sPosition = {
                        window_x: 0,
                        window_y: screenData.window.y * screenData.scale,
                        window_width: sSize[0],
                        window_height: sSize[1]
                    },
                    tracking = {
                        commands: [],
                        frames: [],
                        mode: 'tracking',
                        screen_size: sSize,
                        window_rect: sPosition,
                        sensors: entryAdditionalData.data.sensorsData,
                        // touches: entryAdditionalData.data.touchesData
                    }
                trackingInfoLink = await this.__uploadJsonDataAsFile(tracking, `tracking_${Date.now()}.json`, additionalData)
                let settings = await Storages.SettingsStorage.getSettings()
                if (!(calibrationInfo &&
                        calibrationInfo.calibrationInfoLink &&
                        calibrationInfo.calibrationLink))
                    throw new Error('No calibration data')
                let jobInfoFile = {
                    questionId: dataEntry.questionId,
                    respondentId: dataEntry.respondentId,
                    calibrationInfoFile: calibrationInfo.calibrationInfoLink,
                    calibrationVideoFile: calibrationInfo.calibrationLink,
                    cameraData: settings.cameraData,
                    trackingInfoFile: trackingInfoLink,
                    trackingVideoFile: uploadUrl,
                    webviewData: webviewDataLink
                }
                jobInfoLink = await this.__uploadJsonDataAsFile(jobInfoFile, 'wet-job-info.json', additionalData)
            }

            if (dataEntry.entryType === DataEntryType.RESPONSEDATA) {
                let __additionalData = {}
                Object.assign(__additionalData, additionalData)
                __additionalData.filePath = indexLink
                await this.__dataUploaded(__additionalData)
                if (dataEntry.dataType === DataType.CAMERA &&
                    entryAdditionalData.data.neurolabTrackers & trackerType.Eye === trackerType.Eye) {
                    let __additionalData = {}
                    Object.assign(__additionalData, additionalData)
                    delete __additionalData.webcamTracker
                    __additionalData.webEyeTracker = true
                    __additionalData.filePath = jobInfoLink
                    await this.__dataUploaded(__additionalData)
                }
            }

            dataEntry.uploadedUrl = uploadUrl
            if (dataEntry.entryType === DataEntryType.CALIBRATION) {
                entryAdditionalData.data.calibrationInfoLink = calibrationInfoLink
                entryAdditionalData.data.calibrationLink = uploadUrl
                dataEntry.additionalData = JSON.stringify(entryAdditionalData)
            } else if (dataEntry.dataType === DataType.CAMERA &&
                entryAdditionalData.data.neurolabTrackers & trackerType.Eye === trackerType.Eye) {
                entryAdditionalData.data.trackingInfoLink = trackingInfoLink
                entryAdditionalData.data.calibrationInfoLink = calibrationInfoLink
                dataEntry.additionalData = JSON.stringify(entryAdditionalData)
            }
            await Storages.DataEntryStorage.update(dataEntry)
            await Storages.DataEntryStorage.setSyncStatusById(dataEntry._id, SyncStatus.SUCCESSFUL)
            try {
                await RNFetchBlob.fs.unlink(dataEntry.path)
                this.currentUploadPercentage = 1
                return entryAdditionalData
            } catch (e) {
                Logger.error(e)
            }
        } catch (e) {
            if (e.name !== AbortErrorName)
                await Storages.DataEntryStorage.setSyncStatusById(dataEntry._id, SyncStatus.ERROR, e.message)
            throw e
        }
    }

    __setJobText(respId, dataEntry) { // TODO: replace this method with simple setting strings
        this.currentJob = dataEntry.dataType === DataType.SCREENSHOTS ? i18n.t('job_title_screen') : i18n.t('job_title_camera')
        this.currentStep = dataEntry.dataType === DataType.SCREENSHOTS ? 4 : 3
        Logger.log(`Start upload ${dataEntry.dataType} file`)
    }

    async getCalibrationEntryById(respId) {
        let calibrationEntry = null
        try {
            calibrationEntry = await Storages.DataEntryStorage.getCalibrationForRespondent(respId)
        } catch {}
        return calibrationEntry
    }

    async __getCalibrationData(respId) {
        let getAdditionalData = (calibrationEntry) => {
            if (!calibrationEntry)
                throw new Error('Calibration data not found')
            let calInfo = JSON.parse(calibrationEntry.additionalData).data
            if (calibrationEntry.syncStatus === SyncStatus.SUCCESSFUL) {
                return calInfo
            }
            return null
        }
        let calibrationEntry = await this.getCalibrationEntryById(respId)
        if (!calibrationEntry)
            return
        let calibrationInfo = await getAdditionalData(calibrationEntry)
        if (calibrationInfo)
            return calibrationInfo
        this.currentJob = i18n.t('job_title_calibration')
        this.currentStep = 2
        await this.__uploadDataEntry(calibrationEntry)
        calibrationEntry = await Storages.DataEntryStorage.getCalibrationForRespondent(respId)
        calibrationInfo = getAdditionalData(calibrationEntry)
        if (!calibrationInfo)
            throw new Error('Unable to obtain calibration info')
        return calibrationInfo
    }

    currentAnswer(answers) {
        let result = [],
            questions = [],
            isLast = answers.length - 1,
            lastId = null;
        answers.map((answer, index) => {
            let obj = JSON.parse(answer.answers)
            lastId = (index === isLast) && answer.qid
            questions.push(answer.qid)
            result = result.concat(obj)
        })
        return {
            questions,
            answers: JSON.stringify(result),
            lastAnsweredQuestion: lastId
        }
    }

    async postRespondentAnswers({respId, quesId}, isLast = false) {
        try {
        questionId = quesId || "end";
        let respondent = await Storages.RespondentStorage.getById(respId);
        let questions = await Storages.QuestionStorage.getAllRespondentAnswersToUpload(respId); // array
        if (respondent.areAnswersUploaded) return
        let lastAnsweredId = respondent.lastUploadedAnswerId;
        let uploadedAnswersId = respondent.uploadedAnswers;

        let currAnswerContainer = this.currentAnswer(questions);
        let questionIds = currAnswerContainer.questions
        let currAnswer = currAnswerContainer.answers
        let lastAnswerID = currAnswerContainer.lastAnsweredQuestion

        let requestUri = PathHelper.combine(Constants.serverUrl, `PostRespondentAnswer.cmd`)
        let form = new FormData()
        // {
        //     status: 1,
        //     uid: respondent.ct_id,
        //     answers: JSON.parse(respondent.result)
        // }    
        form.append('uid', respondent.ct_id)
        form.append('qid', Number(questionId))
        form.append('surveyCode', respondent.surveyCode)
        form.append('answers', currAnswer)
        form.append('startDate', respondent.createdAt.getTime())
        form.append('lastAnswer', respondent.createdAt.getTime())
        form.append('lastAnsweredQId', lastAnsweredId)
        form.append('status', isLast ? 2 : 1)
        
        let res = await timeoutFetch(fetch(requestUri, {
            method: 'POST',
            body: form
        }), 60000)
        let parsed = await res.json()
        if (res.status !== 200) {
            Logger.fetchError(requestUri, parsed)
            Logger.warn(`Request failed. \nUrl: ${res.url} \nStatus: ${res.status} \n${parsed}`)
            throw new Error(`Request failed. Status: ${res.status}`)
        } else {
            Logger.fetchSuccess(requestUri, {
                parsed
            })
            // check err
            if (parsed.errorCode === 410) return
            await Storages.RespondentStorage.answerUploaded(respId, questionId, lastAnswerID)
            await Storages.QuestionStorage.answerUploaded(questionIds)
            if (isLast) {
                Storages.QuestionStorage.deleteAll()
                await Storages.RespondentStorage.answersUploaded(respId)
            }
            
            if (parsed?.CheckResult) {
                await Storages.RespondentStorage.setStatus(respId.toString(), parsed?.CheckResult)
            }
        }
        } catch(e) {
            console.log("error "+ e)
        }
    }

    async __syncRespondentData(respId, payload = {}) {
        this.totalUploadPercentage = 0
        this.tempUpload = 0
        let syncDataEntries = []
        let { qid, lqid, isLast } = payload;
        // await this.postRespondentAnswers(respId, qid, lqid, isLast)
        this.isSyncingMediaFiles = true
        let calibrationEntry = await this.getCalibrationEntryById(respId)
        let respondentEntries = await Storages.DataEntryStorage.getRespondentDataToSync(respId)
        syncDataEntries.unshift(calibrationEntry, respondentEntries)
        this.generalSize = await this.getTotalUploadSizeForEntries(syncDataEntries.flat(1))
        let calibrationInfo = await this.__getCalibrationData(respId)
        if (this.__isCancelling(respId))
            throw new AbortError()
        if (respondentEntries.length > 0) {
            this.__setJobText(respId, respondentEntries[0])
            for (let i = 0; i < respondentEntries.length; i++) {
                this.__setJobText(respId, respondentEntries[i])
                await this.__uploadDataEntry(respondentEntries[i], calibrationInfo)
            }
        }
        this.isSyncingMediaFiles = false
        await Storages.RespondentStorage.dataUploaded(respId)
        // this.startValidateResps() // FIXME researcher functionality
    }

    async getTotalUploadSizeForEntries(entries) {
        let totalSize = 0
        try {
            for (let i = 0; i < entries.length; i++) {
                let stats = await RNFetchBlob.fs.stat(entries[i].path)
                totalSize += stats.size
            }
            return totalSize
        } catch {
            return totalSize
        }
    }

    @action
    async validateData(respIds) { //array of respondent ids
        let requestUri = PathHelper.combine(Constants.serverUrl, 'CheckRespondentsStatus.ashx')
        try {
            if (!NetInfoService.instance.isConnected)
                throw new Error(i18n.t('no_internet'))

            if (respIds.constructor !== Array)
                respIds = [respIds]

            let res = await fetch(requestUri, {
                method: 'POST',
                body: new Blob([JSON.stringify({
                    Respondents: respIds
                })]),
                signal: (this.controller ? this.controller.signal : undefined)
            })
            let checkResult = await res.json()
            if (!checkResult.res || checkResult.res.toString() !== '1') {
                let additionalErrorData = ''
                if (checkResult.fullerrormessage)
                    additionalErrorData = checkResult.FullErrorMessage
                else if (checkResult.errormessage)
                    additionalErrorData = checkResult.ErrorMessage

                if (additionalErrorData) {
                    additionalErrorData = `${i18n.t('error')}: ${additionalErrorData}`
                }
                if (this.tries < 2) {
                    Logger.error(`Check respondent error: ${respIds}. Try to restart. Tries: ${this.tries}`)
                    this.upload(respIds)
                    this.tries = + 1
                } else {
                    Logger.error(`Unable to check respondents with id's: ${respIds}. Additional info: ${additionalErrorData}`)
                    throw new Error('Unable to check respondents.')
                }
            } else {
                if (checkResult.checkResult === null)
                    throw new Error('Check respondent status error')
                Logger.fetchSuccess(requestUri, respIds)
                for (let i = 0; i < checkResult.checkResult.length; i++) {
                    let result = checkResult.checkResult[i]
                    await Storages.RespondentStorage.setStatus(result.RespondentId.toString(), result.Result)
                }
            }
        } catch (e) {
            Logger.error(`Can't process validate respondent: ${respIds}, error from server: ${e}`)
            throw e
        }
    }

    upload(respId = null, payload = {}) {
        if (respId === null || respId === -1) return
        if (respId)
            this.__addRespToSync(respId, payload)
        else
            this.__uploadAll()
    }

    async getRespondentsToSync() {
        let respsToSync = await Storages.RespondentStorage.getAllRespondentsToSync()
        return respsToSync
    }

    async __uploadAll() {
        let __respsToSync = await this.getRespondentsToSync()
        for (let i = 0; i < __respsToSync.length; i++) {
            Logger.log(__respsToSync[i])
            this.__addRespToSync(__respsToSync[i], {
                isLast: true
            })
        }
    }

    @action
    __addRespToSync(respId, payload) {
        if (this.respsToSyncKeys.length > 0 && this.respsToSyncKeys.indexOf(x => x === respId) >= 0)//it's alredy added
            return

        transaction(() => {
            this.respsToSyncKeys.push(respId)
            this.respsToSync.set(respId, { state: UploadState.Waiting, error: null })
        })

        this.uploadPromise = this.uploadPromise
            .then(() => {
                let resItem = this.respsToSync.get(respId)
                if (this.__isCancelling(respId)) {
                    let resItem = this.respsToSync.get(respId)
                    resItem.state = UploadState.Canceled
                    this.respsToSync.set(respId, resItem)
                    if (this.respsToSyncKeys.length == 0 && this.cancelAll) {
                        this.cancelAll = false
                        Logger.log('this.cancelAll = false')
                    }
                    return Promise.resolve()
                }
                resItem.state = UploadState.InProgress
                this.respsToSync.set(respId, resItem)
                return this.__startUpload(respId, payload)
                    .then(() => {
                        this.__removeRespToSync(respId)
                        let respObj = this.respsToSync.get(respId)
                        if (respObj && respObj.state != UploadState.Canceled && respObj.state != UploadState.Error) {
                            respObj.state = UploadState.Finished
                            this.totalUploadPercentage = 0
                        }
                        if (this.respsToSyncKeys.length == 0 && this.cancelAll) {
                            this.cancelAll = false
                            Logger.log('this.cancelAll = false')
                        }
                        return Promise.resolve()
                    })
            })
    }

    @action
    async __startUpload(respId, payload) { // TODO: replace sync entries with iterator
        this.currentJob = i18n.t('job_title_validation')
        this.currentStep = 1
        this.controller = new AbortController()
        this.currentFetchBlobTask = null
        try {
            await this.validateData(respId)
            let resps = await Storages.RespondentStorage.getAllRespondentsToSync()
            if (resps.filter(r => r === respId).length < 1)
                throw new Error('Respondent is invalid')
            await this.__syncRespondentData(respId, payload)
        } catch (e) { //handle cancel
            Logger.log(e)
            if (!this.__isCancelling(respId)) {
                let currentResp = this.respsToSync.get(respId)
                currentResp.error = e
                currentResp.state = UploadState.Error
                this.respsToSync.set(respId, currentResp)
            }
        }
        BackgroundTimer.clearInterval(this.cancelIntervalId)
        transaction(() => {
            let currentResp = this.respsToSync.get(respId)
            if ((!NetInfoService.instance.isConnected) && !this.__isCancelling(respId)) {
                currentResp.error = [getNoInternetError()]
                currentResp.state = UploadState.Error
                this.respsToSync.set(respId, currentResp)
            }
            if (this.__isCancelling(respId)) {
                currentResp.error = null
                currentResp.state = UploadState.Canceled
                this.respsToSync.set(respId, currentResp)
            }
            this.currentJob = null
        })
        return respId
    }

    @action
    __removeRespToSync(respId) {
        let itemToRemoveIndex = this.respsToSyncKeys.indexOf(respId)
        if (itemToRemoveIndex >= 0) {
            this.respsToSyncKeys.splice(itemToRemoveIndex, 1)
        }
    }

    cancel(respId = null) {
        if (respId)
            this.__removeRespToSync(respId)
            const currentObj = this.respsToSync.get(respId)
            if (currentObj) {
                currentObj.state = UploadState.Canceled
                this.respsToSync.set(respId, currentObj)
            }
        else
            this.__cancelAll()
    }

    getUploadItem(respId) {
        if (!respId)
            return null
        return this.respsToSync.get(respId)
    }

    __cancelAll() {
        if (!this.cancelAll) {
            this.cancelAll = true
            //splice(0, items.length) doesn't work for some reason
            while (this.respsToSyncKeys.length > 0) {
                this.cancel(this.respsToSyncKeys[0])
            }
            let tasks = {}
            this.cancelIntervalId = BackgroundTimer.setInterval(() => {
                try {
                    if (this.currentFetchBlobTask && !tasks[this.currentFetchBlobTask.taskId]) {
                        this.currentFetchBlobTask.cancel()
                        tasks[this.currentFetchBlobTask.taskId] = true
                    }
                } catch (e) {
                    Logger.warn('Error on upload task cancelling: ' + e.message)
                }
                try {
                    if (this.controller) {
                        this.controller.abort()
                    }
                } catch (e) {
                    Logger.warn('Error on upload task cancelling: ' + e.message)
                }
            }, 100)
        }
    }

    bgWorker(callback) {
        this.validateTimer = BackgroundTimer.setInterval(() => {
            callback()
            .then((respIds) => {
                if (respIds?.length === 0) {
                    BackgroundTimer.clearInterval(this.validateTimer);
                }
            })
        }, 30000)
    }

    async checkRespondentsVideoStatus(resps) {
        try {
            this.isRespValidatingStarted = true
            let hasGeneratedVideo = false
            let respondentsToCheck = []
            let requestUri = PathHelper.combine(Constants.serverUrl, `UniversalNLProjectCommand.cmd?command=getrespondentvideos&respondents=${resps.join(',')}`)
            let r = await timeoutFetch(fetch(requestUri), 15000)
            let data = await r.json()
            const res = data.res
            Logger.log(`Respondent's video check: ${JSON.stringify(res)}`)
            for (let i = 0; i < res.length; i++) {
                try {
                    let currentResItem = res[i]
                    Logger.log(`Check status of video for respondent: ${currentResItem.rid}`)
                        if (currentResItem.questions.length > 0 && currentResItem.questions[0].url) { // has neuroQuestion and generated video
                            let entry = await Storages.RespondentStorage.getById(currentResItem.rid.toString())
                            entry.resultVideoUrl = currentResItem.questions[0].url
                            await Storages.RespondentStorage.update(entry)
                            if (!hasGeneratedVideo) {
                                hasGeneratedVideo = true
                                this.isRespValidatingStarted = false
                            }
                        }
                        if (currentResItem.questions.length > 0 && !currentResItem.questions[0].url) {
                            respondentsToCheck.push(currentResItem.rid)
                        }
                } catch(e) {
                    Logger.error(e)
                }
            }
            
            if (hasGeneratedVideo && AppStateService.instance.currentState !== 'active') {
                PushNotification.localNotification({
                    /* Android Only Properties */
                    id: '15', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
                    channelId: 'video_generated',
                    channelName: 'Video Generated',
                    channelDescription: 'Video Generated',
                    // color: EStyleSheet.value('$primaryBlueColor'), // (optional) default: system default
                    vibrate: true,
                    ongoing: false, // (optional) set whether this is an 'ongoing' notification
                    importance: 'max',//
                    priority: 'max',
                    message: 'Video is generated', // (required)
                    playSound: true
                })
            }
            return Promise.resolve(respondentsToCheck)
        } catch (e) {
            Logger.error(e)
        }
    }

    async bgWorkerCallback() {
        let resps = await Storages.RespondentStorage.getRespWithNoVideo()
        let respsToCheck = await this.checkRespondentsVideoStatus(resps)
        return respsToCheck
    }

    async startValidateResps() {// TODO: find a better place for a worker
        if (!this.isRespValidatingStarted) {
            Logger.log('Start validate respondents')
            try {
                let resps = await Storages.RespondentStorage.getRespWithNoVideo()
                if (resps.length > 0) {
                    this.checkRespondentsVideoStatus(resps)
                    .then((respIds) => {
                        if (respIds.length > 0) {
                            // Start background/foreground worker
                            let cbFunction = this.bgWorkerCallback.bind(this)
                            this.bgWorker(cbFunction)
                        }
                    })
                }
            } catch {
                return new Error('Could not get respondent Storage')
            }
        }
    }
}