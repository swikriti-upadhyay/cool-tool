import React from 'react'
import PushNotification from 'react-native-push-notification'
import Orientation from 'react-native-orientation-locker'
import i18n from '../utils/i18n';
import {
    Storages,
    DataEntryType,
    DataType,
    RespondentStatus,
    SyncStatus
} from '../storage/data-storage-helper'
import CameraTracker from '../devices/camera-tracker'
import CustomTracker from '../devices/custom-tracker'
import ScreenshotTracker from '../devices/screen-tracker'
import Logger from '../utils/logger'
import MouseTracker from '../devices/mouse-tracker'
import WebsiteTracker from '../devices/website-tracker'
import SensorsTracker from '../devices/sensors-tracker'
import ScreenHelper from '../utils/screen-helper'
import {
    SkipItem,
    CameraCalibration,
    EyeTrackerCalibration,
    QuestionItem,
    SurveyFinishedItem,
    SurveyStopRecord,
    InstructionItem,
    SyncItem,
    VisualInstructionItem,
    PermissionsItem,
    VideoInstructionItem,
    AppInstructionItem,
    TextItem,
    SurveyItemState,
    ProjectStopped
} from './survey-items'
import trackerType from './tracker-type'
import { 
    questItemType,
    questionType,
    neuroQuestions
} from './question'
import QuestionAnswer from './question-answer'
import QuestionAnswerContainer from './question-answer-container'
import Disposer from '../utils/disposer'
import EventDispatcher from '../utils/event-dispatcher'
import Constants from '../constants'

export const SurveyState = {
    None: 0,
    Running: 2
}

export default class Survey extends EventDispatcher {

    static getCurrent() {
        return Survey.instance
    }

    static getNewSurvey(surveyData) {
        Survey.instance = new Survey(surveyData)
        return Survey.getCurrent()
    }

    constructor(surveyData) {
        super()
        this.initTrackers()
        if (!surveyData.items) return
        this.init(surveyData)
    }

    init(surveyData) {
        this.surveyStatus = SurveyState.Running;
        this.neuroQuestionsCount = 0;
        const MAX_NEURO_QUESTIONS = 1;

        this.surveyCode = surveyData.settings.surveyCode
        this.linkForComplete = surveyData.settings.LinkForComplete
        this.linkForDisqualified = surveyData.settings.LinkForDisqualified
        this.linqForOverquota = surveyData.settings.LinqForOverquota

        this.isAnon = surveyData.isAnon
        this.isGuest = surveyData.isGuest
        this.hasNeuroQuestions = surveyData.hasNeuroQuestion
        this.currentNeuroQuestionType = null
        this.appData = null
        this.isLast = false

        this.projectName = surveyData.settings.projectName || surveyData.settings.surveyCode
        if (this.projectName.toUpperCase() == 'UNIVERSAL') {
            this.projectName = 'My UXReality recording'
            this.surveyCode = 'universal'
        }

        this.respondentId = surveyData.respondent?.uid.toString() || -1 //this.generateUid() //implement generateUid for offline
        this.ct_id = surveyData.respondent?.uid

        this.translations = surveyData.settings.translations

        this.currentLanguage = this.translations.filter((translation) => translation.default === 1)[0];
        this.langId = this.currentLanguage.id;
        this.languageKey = surveyData.settings.language;
        this.videoInstructionUrl = surveyData.settings.videoInstructionUrl;
        this.preview = !!surveyData.settings.doNotPostRespondentAnswers;
        this.setProjectLanguage()

        this.surveyItems = new Map()
        const APP_KEY = -3013
        if (this.hasNeuroQuestions) {
            this.surveyItems.set(APP_KEY, new AppInstructionItem(this))
        }
        const questions = surveyData.items.filter(q => q.questItemType === questItemType.QUESTION)
        const simpleQuestions = questions.filter(q => {
            return !neuroQuestions.includes(q.questionType)
        })
        for (let [index, qi] of questions.entries()) {
            if (this.neuroQuestionsCount >= MAX_NEURO_QUESTIONS && neuroQuestions.includes(qi.questionType)) break;
            let totalQuestions = questions.length - 1;
            let isLast = index === totalQuestions;
            this.surveyItems.set(qi.id, new QuestionItem(this, qi, { 
                heading: i18n.t('question_heading', { num: simpleQuestions.indexOf(qi) + 1, total: totalQuestions }),
                isLast }))
            if (neuroQuestions.includes(qi.questionType)) {
                this.currentNeuroQuestionType = qi.questionType
                if (qi.questionType !== questionType.App) {
                    this.surveyItems.delete(APP_KEY)
                } else {
                    this.appData = {
                        ...qi,
                        name: qi.name || ''
                    }
                }
                this.neuroQuestionsCount =+ 1;
            }
        }
        this.__surveyItemsIterator = this.surveyItems.values()
        this.isEyeTrackerCalibrated = false
        this.isCameraCalibrated = false
        this.answers = []

        this.startDate = new Date()
    }

    setProjectLanguage() {
        i18n.changeLanguage(this.languageKey);
    }

    initTrackers() {
        this.cameraTracker = new CameraTracker()
        this.screenshotTracker = new ScreenshotTracker()
        this.mouseTracker = new MouseTracker()
        this.websiteTracker = new WebsiteTracker()
        this.customTracker = new CustomTracker()
        this.sensorsTracker = new SensorsTracker()
    }

    currentSurveyItem = null

    set isLastAnswer(isLast) {
        this.isLast = isLast
    }

    set isPreview(state) {
        this.preview = state
    }
    get isPreview() {
        return this.preview;
    }

    setCurrentSurveyItem(surveyItem) {
        if (surveyItem != null) {
            let finishHndlr = (data) => {
                    surveyItem.removeListener('finished', finishHndlr)
                    if (data.skipReason) {
                        this.surveyItems.clear()
                        this.setCurrentSurveyItem(new SkipItem(this, data.skipReason, data.skipReason instanceof Error))
                    } else {
                        if (surveyItem.parent && !surveyItem.isCancelled) {
                            if (surveyItem.isParentSkip && surveyItem?.parent?.parent) {
                                this.setCurrentSurveyItem(surveyItem.parent.parent)
                            } else {
                                this.setCurrentSurveyItem(surveyItem.parent)
                            }
                        } else {
                            this.setCurrentSurveyItem(this.getNextRendarableObject())
                        }
                    }
                },
                startHndlr = (data) => {
                    if (data.skipReason) {
                        this.surveyItems.clear()
                        surveyItem.removeListener('finished', finishHndlr)
                        this.setCurrentSurveyItem(new SkipItem(this, data.skipReason, data.skipReason instanceof Error))
                    }
                }
            surveyItem.addListener('started', startHndlr)
            surveyItem.addListener('finished', finishHndlr)
        } else {
            surveyItem = new ProjectStopped(this)
        }
        this.currentSurveyItem = surveyItem
        
        this.emitAsync('surveyItemChanged', this)
    }

    run() {
        this.setCurrentSurveyItem(this.getNextRendarableObject())
    }

    lock(orientation) {
        switch(orientation) {
            case "Vertical":
                return Orientation.lockToPortrait()
            case "Horizontal":
                return Orientation.lockToLandscape()
        }
    }

    getNextRendarableObject() {
        if (this.isFinished) {
            if (this.currentSurveyItem.constructor === SurveyFinishedItem)
                return
            return new SurveyFinishedItem(this)
        }
        if (!this.__surveyItemsIterator) return null
        let iter = this.__surveyItemsIterator.next()
        if (iter.done && !this.isPreview) { // end of iterations
            if (!this.resultScheduled) {
                this.resultScheduled = true
                let syncItemParent = null
                let syncItem = new SyncItem(this)
                return syncItem
            }
            if(this.isGuest)
                return new SurveyFinishedItem(this)
        }
        let nextSurveyItem = iter.value
        if (iter.value instanceof QuestionItem) {

            const eyeCalibrationRequired = iter.value.isTrackerEnabled(trackerType.Eye) && !this.isEyeTrackerCalibrated,
                cameraCalibrationRequired = iter.value.isCameraTrackerRequired && !this.isCameraCalibrated

                // if (iter.value.questionType === questionType.App) {
                //     iter.value.eyeTrackingWebSiteObjective = `
                //             <div class="app_instruction">
                //                 <h3>Recording is beginning</h3>
                //                 <h3>UX Reality will continue running in the background.</h3>
                //                 <h3>Now open the app you want to test</h3>
                //             </div>`
                // }

                if(neuroQuestions.includes(iter.value.questionType)) { // TODO: add key in iterator place
                    let stopRecording = new SurveyStopRecord(this)
                    nextSurveyItem.parent = stopRecording
                }

            if (neuroQuestions.includes(iter.value.questionType)) {
                if (iter.value?.eyeTrackingWebSiteObjective?.length) { // render if text exists
                    iter.value.eyeTrackingWebSiteObjective = iter.value.eyeTrackingWebSiteObjective || i18n.t('no_tasks')
                    let instructionItem = new InstructionItem(this, iter.value, {
                            heading: i18n.t('task_heading'),
                            title: i18n.t('task_title')
                        })
                    instructionItem.parent = nextSurveyItem
                    nextSurveyItem = instructionItem
                }
            }

            if (questionType.Prototype === iter.value.questionType) { // TODO: refactor this pease of shit
                this.lock(iter.value.prototypeOrientation)
                let eyeTrackingWebSiteObjective = i18n.t('prototype_text', { val: iter.value.targetDeviceTitle})
                let instructionItem = new InstructionItem(this, {...iter.value, ...{ eyeTrackingWebSiteObjective }}, {
                        heading: i18n.t('info_heading'),
                        title: i18n.t('info_title')
                    })
                instructionItem.parent = nextSurveyItem
                nextSurveyItem = instructionItem
            }

            if (eyeCalibrationRequired) {
                let eyeTrackerCalibration = new EyeTrackerCalibration(this)
                eyeTrackerCalibration.parent = nextSurveyItem
                nextSurveyItem = eyeTrackerCalibration
            }
            
            if (Constants.skipCalibration) return nextSurveyItem

            if (cameraCalibrationRequired) {
                let cameraCalibration = new CameraCalibration(this)
                cameraCalibration.parent = nextSurveyItem
                nextSurveyItem = cameraCalibration
            }

            if (eyeCalibrationRequired || cameraCalibrationRequired) {
                let si = new VisualInstructionItem(this, trackerType.Webcam)
                si.parent = nextSurveyItem
                nextSurveyItem = si
            }

            if (eyeCalibrationRequired || cameraCalibrationRequired) {
                let si = new VideoInstructionItem(this)
                si.parent = nextSurveyItem
                nextSurveyItem = si
            }
        }
        return nextSurveyItem
    }

    startDataCollection() {
        Logger.log(`startDataCollection: r: ${this.respondentId}, q: ${this.currentSurveyItem.id}`)
        let resp = this.respondentId,
            sItem = this.currentSurveyItem,
            sItemId = sItem.id
        this.screenData = ScreenHelper.getScreenData()

        let cameraPromise = Promise.resolve()

        if (sItem.isCameraTrackerRequired && !this.isPreview) {
            cameraPromise = this.cameraTracker.startDataCollection(resp, sItemId, this.screenData)
        }

        //TODO: refactor camera recorder library
        return cameraPromise //camera start takes about a second, other trackers start almost immediately
            .then(() => {
                let promisesToWait = []
                if (sItem.isScreenshotTrackerRequired && !this.isPreview) {
                    promisesToWait.push(this.screenshotTracker.startDataCollection(resp, sItemId, this.screenData))
                    promisesToWait.push(this.websiteTracker.startDataCollection(resp, sItemId))
                }
                if (sItem.isMouseTrackerRequired && !this.isPreview) {
                    promisesToWait.push(this.mouseTracker.startDataCollection(resp, sItem, this.screenData))
                }
                if (sItem.isNeurolab && !this.isPreview) {
                    promisesToWait.push(this.customTracker.startDataCollection(resp, sItem))
                    promisesToWait.push(this.sensorsTracker.startDataCollection(resp, sItem))
                }
                return Promise.all(promisesToWait)
            })
    }

    stopDataCollection() {
        let promise = null,
            sItem = this.currentSurveyItem;
        if (sItem) {
            let promisesToWait = []
            if (sItem.isCameraTrackerRequired && !this.isPreview) {
                promisesToWait.push(this.cameraTracker.stopDataCollection())
            }
            if (sItem.isScreenshotTrackerRequired && !this.isPreview) {
                promisesToWait.push(this.screenshotTracker.stopDataCollection())
                promisesToWait.push(this.websiteTracker.stopDataCollection())
            }
            if (sItem.isMouseTrackerRequired && !this.isPreview) {
                promisesToWait.push(this.mouseTracker.stopDataCollection())
            }
            if (sItem.isNeurolab && !this.isPreview) {
                promisesToWait.push(this.customTracker.stopDataCollection())
                promisesToWait.push(this.sensorsTracker.stopDataCollection())
            }

            promise = Promise.all(promisesToWait)
        } else {
            promise = Promise.reject('No question data')
        }
        return promise
    }

    dataCollection() {
        let promisesToWait = []

        let {dataCollectionStartTime, responseElapsedMilliseconds, isNeurolab} = this.currentSurveyItem

        let neurolabData = {}
        if (isNeurolab && !this.isPreview) {
            neurolabData.customData = this.customTracker.dataCollection(dataCollectionStartTime, responseElapsedMilliseconds)
            neurolabData.sensorsData = this.sensorsTracker.dataCollection(dataCollectionStartTime, responseElapsedMilliseconds)
            neurolabData.touchesData = this.mouseTracker.dataCollection(dataCollectionStartTime, responseElapsedMilliseconds)
            neurolabData.pages = this.websiteTracker.dataCollection(dataCollectionStartTime, 
            responseElapsedMilliseconds)
        }

        //TODO: add error handling for all promises
        if (this.currentSurveyItem.isCameraTrackerRequired && !this.isPreview) {
            let res = this.cameraTracker.dataCollection()
            res.data.neurolabTrackers = this.currentSurveyItem.neurolabTrackers
            res.data.sensorsData = neurolabData.sensorsData
            res.data.touchesData = neurolabData.touchesData
            res.data.pages = neurolabData.pages
            if (this.currentSurveyItem.isTrackerEnabled(trackerType.Webcam)) {
                neurolabData.webcam = {
                    data: {
                        surveyType: 0,
                        webcamTracker: true,
                        isOff: false,
                        startTime: res.data.trackingStartTime
                    },
                    nodata: []
                }
            }
            if (this.currentSurveyItem.isTrackerEnabled(trackerType.Eye)) {
                neurolabData.eyetracker = {
                    points: [],
                    version: 4,
                    timeStep: 33,
                    calibrationStars: 5
                }
            }
            let cameraDataPromise = Storages.DataEntryStorage.insert({
                _id: res.data.recordFilePath,
                path: res.data.recordFilePath,
                // pathAction: PathAction.NONE,
                respondentId: res.data.respondentId,
                questionId: res.data.questionId,
                syncStatus: SyncStatus.NONE,
                // respondentStatus: RespondentStatus.UNKNOWN,
                dataType: DataType.CAMERA,
                entryType: DataEntryType.RESPONSEDATA,
                additionalData: JSON.stringify(res),
                uploadedUrl: ''
            })
            promisesToWait.push(cameraDataPromise)
        }
        if (this.currentSurveyItem.isScreenshotTrackerRequired && !this.isPreview) {
            let res = this.screenshotTracker.dataCollection()
            res.data.neurolabTrackers = this.currentSurveyItem.neurolabTrackers
            neurolabData.website = res.data
            neurolabData.website.data = []
            let screenDataPromise = Storages.DataEntryStorage.insert({
                _id: res.data.recordFilePath,
                path: res.data.recordFilePath,
                // pathAction: PathAction.NONE,
                respondentId: res.data.respondentId,
                questionId: res.data.questionId,
                syncStatus: SyncStatus.NONE,
                // respondentStatus: RespondentStatus.UNKNOWN,
                dataType: DataType.SCREENSHOTS,
                entryType: DataEntryType.RESPONSEDATA,
                additionalData: JSON.stringify(res),
                uploadedUrl: ''
            })
            promisesToWait.push(screenDataPromise)
        }

        if (this.currentSurveyItem.isMouseTrackerRequired && !this.isPreview) {
            let mouseData = this.mouseTracker.dataCollection(dataCollectionStartTime, responseElapsedMilliseconds)
            neurolabData.touches = {
                data: mouseData.touches
            }
            neurolabData.scroll = {
                data: mouseData.scroll
            }
            if (mouseData.area)
                neurolabData.scroll.area = mouseData.area
            if (this.currentSurveyItem.isScreenshotTrackerRequired) {
                let websiteData = this.websiteTracker.dataCollection(dataCollectionStartTime, responseElapsedMilliseconds)
                websiteData.clicks = mouseData.click
                Object.assign(websiteData, neurolabData.website)
                neurolabData.website = websiteData
            }
        }

        // if (this.currentSurveyItem.questionType === questionType.Instructions) {
        //     return Promise.all(promisesToWait)
        // }
        if (!this.isPreview) {
            let answer = null;
            if (this.currentSurveyItem.isNeurolab) {
                this.hasNeuroQuestions = true
                answer = new QuestionAnswer({
                    neurolabData: neurolabData,
                    neurolabTrackers: this.currentSurveyItem.neurolabTrackers,
                    actualNeurolabTrackers: this.currentSurveyItem.neurolabTrackers,
                    dataCollectionStartTime: dataCollectionStartTime,
                    elapsedMilliseconds: responseElapsedMilliseconds,
                    // alternative: this.currentSurveyItem.alternative
                })
            } else {
                answer = this.processQuestionAnswer({
                    responseElapsedMilliseconds,
                    alternatives: this.currentSurveyItem.alternative,
                    langId: this.langId
                })
    
            }
    
            let answerContainer = new QuestionAnswerContainer(this.currentSurveyItem.id)
            answerContainer.answers = answerContainer.answers.concat(answer)
    
            this.answers.push(answerContainer)
        }

        return Promise.all(promisesToWait)
    }

    processQuestionAnswer(answerObject) {
        let { responseElapsedMilliseconds, alternatives, langId } = answerObject
        let answers = []
        if (alternatives?.length > 0) {
            alternatives.map((alternative) => {
                answers.push(new QuestionAnswer({
                    neurolabData: null,
                    alternative: alternative?.id,
                    elapsedMilliseconds: responseElapsedMilliseconds,
                    value: alternative?.value,
                    valueText: alternative?.valueText,
                    lang: langId
                }))
            })
        } else {
            answers.push(new QuestionAnswer({
                neurolabData: null,
                alternative: alternatives?.id,
                elapsedMilliseconds: responseElapsedMilliseconds,
                value: alternatives?.value,
                valueText: alternatives?.valueText,
                lang: langId
            }))
        }
        return answers;
    }

    async startEyeTrackingCalibration() {
        if (this.isPreview) return 0
        this.screenData = ScreenHelper.getScreenData()
        await this.cameraTracker.startDataCollection(this.respondentId, this.currentSurveyItem.id, this.screenData, true)
        await this.sensorsTracker.startDataCollection(this.respondentId, this.currentSurveyItem)
        return this.cameraTracker.trackingStartTime
    }

    async stopEyeTrackingCalibration(calibrationData) {
        if (this.isPreview) return
        await this.cameraTracker.stopDataCollection()
        await this.sensorsTracker.stopDataCollection()
        let res = await this.cameraTracker.dataCollection(calibrationData)
        let sensorsData = this.sensorsTracker.dataCollection(res.data.trackingStartTime, 6000000)
        res.data.sensorsData = sensorsData
        await Storages.DataEntryStorage.insert({
                    _id: res.data.recordFilePath,
                    path: res.data.recordFilePath,
                    // pathAction: PathAction.NONE,
                    respondentId: res.data.respondentId,
                    questionId: res.data.questionId,
                    syncStatus: SyncStatus.NONE,
                    // respondentStatus: RespondentStatus.UNKNOWN,
                    dataType: DataType.NONE,
                    entryType: DataEntryType.CALIBRATION,
                    additionalData: JSON.stringify(res),
                    uploadedUrl: ''
                })
    }

    __getRespondentObjectToSave() {
        let lastAnswerDate = this.startDate
        if (this.answers.length > 0) {
            lastAnswerDate = new Date(this.answers[this.answers.length - 1].answerTime)
        }
        
        let respondent = {
            _id: this.respondentId.toString(),
            ct_id: this.ct_id,
            status: RespondentStatus.UNKNOWN,
            areDataUploaded: false,
            areAnswersUploaded: false,
            uploadedAnswers: [],
            surveyCode: this.surveyCode,
            projectName: this.projectName,
            isOwnProject: !this.isGuest,
            result: "",
            responseStartDate: this.startDate,
            responseEndDate: lastAnswerDate,
            resultVideoUrl: null,
            hasNeuroQuestions: this.hasNeuroQuestions
        }
        return respondent
    }

    __getAnswersObjectToSave() {
        let answersJson = JSON.stringify(this.answers)

        let questionAnswer = {
            _id: this.currentSurveyItem.id.toString(),
            qid: this.currentSurveyItem.id,
            uid: this.ct_id,
            answers: answersJson,
            uploaded: false
        }
        return questionAnswer
    }

    __finish() {
        PushNotification.clearLocalNotification(1)//1 is recording in progress
    }

    async commitData(isFinished = false, callback) {
        this.isFinished = isFinished
        if (this.isFinished || this.isPreview) return
        if (!this.isCommited) {
            this.isCommited = true
            Disposer.disposeTrackers()
            await Storages.RespondentStorage.insert(this.__getRespondentObjectToSave())
            this.__finish()
        } // TODO: fix this shit
        // await Storages.RespondentStorage.setAnswers(this.respondentId, this.lastAnsweredQuestionId.toString(), this.answers)
        console.log('test')
        await Storages.QuestionStorage.insertOrUpdate(this.__getAnswersObjectToSave())
        this.answers = []
        callback && callback()
    }

    async skip() {
        if (this.isPreview) return
        if (!this.isCommited) {
            try {
                this.isCommited = true

                try {
                    await this.stopDataCollection()
                } catch (e) {
                    Logger.error(e)
                }

                try {
                    Disposer.disposeTrackers()
                    let respondent = this.__getRespondentObjectToSave()
                    this.answers = []
                    respondent.status = RespondentStatus.SKIPPED
                    return Storages.RespondentStorage.insert(respondent)
                } catch (e) {
                    Logger.error(e)
                }

            } catch (e) {
                Logger.error(e)
            }
            this.__finish()
        }
    }

    abort() {
        this.surveyStatus = SurveyState.None;
        this.currentSurveyItem.finish(null, 'Aborted by user')
    }

    stop() {
        this.surveyStatus = SurveyState.None;
        if (this.currentSurveyItem instanceof QuestionItem)
            this.currentSurveyItem.finish()
    }

    destroy() {
        this.surveyStatus = SurveyState.None;
        if (this.currentSurveyItem instanceof QuestionItem)
            this.currentSurveyItem.destroy()
    }

    finish() {
        this.surveyStatus = SurveyState.None;
    }
}