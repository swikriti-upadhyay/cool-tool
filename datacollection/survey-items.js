import EventDispatcher from '../utils/event-dispatcher'
import BackgroundTimer from 'react-native-background-timer'
import trackerType from './tracker-type'
import Logger from '../utils/logger'
import {
    observable
} from 'mobx'
import NLCommon from 'react-native-nl-common'
import DataUploader, {UploadState} from '../sync/data-uploader'
import Constants from '../constants'
import PathHelper from '../utils/path-helper'
import AppStateService from '../utils/app-state-service'
import CommonHelper from '../utils/common-helper'
import PushNotification from 'react-native-push-notification'
import EStyleSheet from 'react-native-extended-stylesheet'

import {questionType, neuroQuestions} from './question'

export const SurveyItemState = {
    Initiated: 0,
    Starting: 1,
    Running: 2,
    Finishing: 3,
    Finished: 4
}

export class BaseSurveyItem extends EventDispatcher {

    get id() {
        return this._id || (this.parent && this.parent.id)
    }

    constructor(survey) {
        super()
        this.survey = survey
        this.alreadyInprogress = false
    }

    async __startFn(data) {
        return data
    }

    async __finishFn(data) {
        return data
    }

    __clearState() {
        return
    }

    @observable state = SurveyItemState.Initiated

    async start(startData) {
        let data = null
        try {
            if (this.state > SurveyItemState.Initiated)
                return
            this.state = SurveyItemState.Starting
            data = await this.__startFn(startData)
            this.emitAsync('started', {
                sender: this,
                data: data
            })
        } catch (e) {
            this.emitAsync('started', {
                sender: this,
                skipReason: e
            })
        }
        this.state = SurveyItemState.Running
        return data
    }

    async finish(finishData, skipReason) {
        let data = null
        try {
            if (this.state > SurveyItemState.Running)
                return
            this.state = SurveyItemState.Finishing
            data = await this.__finishFn(finishData)
            // this.postAnswers()
            this.emitAsync('finished', {
                sender: this,
                data: data,
                skipReason: skipReason ? skipReason : null
            })
        } catch (e) {
            this.emitAsync('finished', {
                sender: this,
                skipReason: e
            })
        }
        this.state = SurveyItemState.Finished
        return data
    }

    // postAnswers() {
    //     this.uploader = DataUploader.getInstance()
    //     this.uploader.postRespondentAnswers(this.survey.ct_id)
    // }

    isCancelled = false

    isParentSkip = false

    get cancelable() {
        return false
    }

    get disableBack() {
        return true
    }

    cancel() {
        if (!this.cancelable)
            throw new Error('Cancellation is not supported')
        this.isCancelled = true
        this.finish()
    }

    skipParent() {
        if (!this.skippable)
            throw new Error('Skip is not supported')
        this.isParentSkip = true
        this.finish()
    }

    destroy() {
        this.__clearState()
    }
}

export class SkipItem extends BaseSurveyItem {
    constructor(survey, skipReason, isError = false) {
        super(survey)
        if (!skipReason)
            skipReason = ''
        this.skipReason = skipReason.message ? skipReason.message : skipReason.toString()
        this.isError = isError
    }

    @observable skipInProgress = true

    async __startFn(data) {
        await this.survey.skip()
        this.skipInProgress = false
        return data
    }
}

export class SurveyFinishedItem extends BaseSurveyItem {
    __startFn() {
        this.survey.finish()
    }
}

export class SurveyStopRecord extends BaseSurveyItem {
    async __startFn(data) {
        this.startTimer()
        if (this.survey.uploadInProgress) return
        // await this.survey.commitData()
        this.uploader = DataUploader.getInstance() // TODO: move to constructor section
        this.startUploadMedia()
        this.survey.uploadInProgress = true
        return data
    }

    startTimer() {
        BackgroundTimer.setTimeout(async () => {
            this.finish()
        }, 7000)
    }

    startUploadMedia() {
        this.uploader.upload(this.survey.respondentId, {
            qid: this.survey.lastAnsweredQuestionId,
            lqid: this.survey.lastAnsweredQuestionId,
            isLast: this.survey.currentSurveyItem.isLastQuestion
        })
    }
}

export class InstructionItem extends BaseSurveyItem {

    constructor(survey, question, params) { //questionType, text
        super(survey)
        let { questionType } = question
        this.questionType = questionType
        this.question = question
        this.params = params
    }

    @observable timeLeft = this.limitTimeout

    get isApplication() {
        return this.questionType === questionType.App;
    }
}

export class SyncItem extends BaseSurveyItem {
    async __startFn(data) {
        this.uploader = DataUploader.getInstance()
        this.startUploading()
        if (this.survey.uploadInProgress) {
            return //this.postAnswers()
        }
        await this.survey.commitData(true) // set finished question
        this.survey.uploadInProgress = true
        return data
    }

    resetTotalUpload() {
        this.uploader.totalUploadPercentage = 0
        this.uploader.tempUpload = 0
    }

    postAnswers() {
        this.uploader.postRespondentAnswers({
            respId: this.survey.respondentId
        }, true)
    }

    restartUploading() {
        this.postAnswers()
        this.startUploading()
        this.uploader.upload(this.survey.respondentId, {
            qid: this.survey.lastAnsweredQuestionId,
            lqid: this.survey.lastAnsweredQuestionId,
            isLast: this.survey.currentSurveyItem.isLastQuestion
        })
    }

    startUploading() {
        let finish = () => {
            BackgroundTimer.setTimeout(() => {
                if (this.isCancelled) {
                    // this.uploader.cancel(this.survey.respondentId) // Cancel uploading
                    this.resetTotalUpload()
                } else if (this.respUpload && this.respUpload.state === UploadState.Error) {
                    this.resetTotalUpload()
                    return
                } else if (this.respUpload && this.respUpload.state === UploadState.Finished) {
                    this.resetTotalUpload()
                    // if (!this.survey.hasNeuroQuestions) { // skip sync screen if no neuroQuestions
                    //     this.survey.currentSurveyItem.finish()
                    //     return
                    // }
                    this.finish()
                } else {
                    finish()
                }
            }, 100)
        }
        finish()
    }

    get cancelable() {
        return true
    }

    get respUpload() {
        return DataUploader.getInstance().getUploadItem(this.survey.respondentId)
    } 
}

export class CameraCalibration extends BaseSurveyItem {
    async __finishFn(data) {
        if (data === true) {
            this.survey.isCameraCalibrated = true
        } else {
            throw new Error('Camera calibration skipped')
        }
        return data
    }
}

export class EyeTrackerCalibration extends BaseSurveyItem {

    async __startFn(data) {
        let startTime = await this.survey.startEyeTrackingCalibration(data)
        return startTime
    }

    async __finishFn(data) {
        await this.survey.stopEyeTrackingCalibration(data)
    }

    get layout() {
        return this.survey.layout
    }
}

export class QuestionItem extends BaseSurveyItem {
    constructor(survey, questionData, params) {
        super(survey)
        if (!questionData)
            throw new Error('questionData is not specified')

        this._id = questionData.id
        this.code = questionData.code
        this.order = questionData.order
        this.name = questionData.name
        this.questionType = questionData.questionType
        this.questItemType = questionData.questItemType
        this.isRequired = questionData.isRequired
        this.sectionId = questionData.sectionId
        this.limitTimeout = (questionData.limitTimeout || 0) * 1000 //server sends limit timeout in seconds
        this.neurolabTrackers = questionData.neurolabTrackers
        this.alternatives = questionData.alternatives
        this.eyeTrackingWebSiteUrl = questionData.eyeTrackingWebSiteUrl
        this.eyeTrackingWebSiteObjective = questionData.eyeTrackingWebSiteObjective
        this.targetDeviceTitle = questionData.targetDeviceTitle
        this.prototypeOrientation = questionData.prototypeOrientation
        this.params = params
        this.isLastQuestion = params.isLast
    }

    isTrackerEnabled(_trackerType) {
        return (this.neurolabTrackers & _trackerType) === _trackerType
    }

    get isCameraTrackerRequired() {
        return this.isTrackerEnabled(trackerType.Eye) ||
            this.isTrackerEnabled(trackerType.Webcam)
    }

    get isScreenshotTrackerRequired() {
        return this.isTrackerEnabled(trackerType.ScreenShot)
    }

    get isMouseTrackerRequired() {
        return this.isTrackerEnabled(trackerType.Mouse) ||
            this.isScreenshotTrackerRequired
    }

    get isNeurolab() {
        return neuroQuestions.includes(this.questionType);
    }

    get isApplication() {
        return this.questionType === questionType.App;
    }

    __pushNotification() {
        this.currentIcon = this.currentIcon === 'rec_in' ? 'rec_out' : 'rec_in'
        this.color = EStyleSheet.value('$redColor')

        PushNotification.localNotification({
            /* Android Only Properties */
            id: '1', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            channelId: 'record_channel',
            channelName: 'Record Channel',
            channelDescription: 'Record Channel',
            ticker: 'Survey Ticker', // (optional)
            autoCancel: false, // (optional) default: true
            smallIcon: this.currentIcon, // (optional) default: 'ic_notification' with fallback for 'ic_launcher'
            color: this.color, // (optional) default: system default
            vibrate: false,
            ongoing: true, // (optional) set whether this is an 'ongoing' notification
            importance: 'low',//
            priority: 'high',
            message: 'Recording in progress', // (required)
            playSound: false,
            actions: '["Stop"]'
        })
    }

    getPackageNameFrom(packageInfo) {
        let packageData = {};
        try {
            packageData = JSON.parse(packageInfo);
        } catch {
            if (packageInfo)
                packageData.value = CommonHelper.getAppIdFromString(packageInfo)
        }
        return packageData;
    }

    async __startFn(data) {
        this.survey.isLastAnswer = this.isLastQuestion
        await this.survey.startDataCollection(data)
        if (this.isApplication) {
            let curName = this.eyeTrackingWebSiteUrl || this.name;
            let packageData = this.getPackageNameFrom(curName);
            let packageID = packageData?.value;
            NLCommon.minimize().then(() => {
                NLCommon.startAppByPackageName(packageID)
                .then((result) => {
                    console.log('startAppByPackageName started');
                })
                .catch((error) => console.warn('startAppByPackageName: could not open', error));
            })
        }
        this.__startDataCollectingTimer()
    }

    __clearState() {
        this.__stopDataCollectingTimer()
        PushNotification.clearLocalNotification(1)
    }

    async __finishFn(data) {
        this.__clearState();
        if (AppStateService.instance.currentState !== 'active' && this.isNeurolab) {
            PushNotification.localNotification({
                /* Android Only Properties */
                id: '10', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
                channelId: 'record_finished',
                channelName: 'Record Finished',
                channelDescription: 'Record Finished',
                ticker: 'Survey Ticker', // (optional)
                // autoCancel: false, // (optional) default: true
                // smallIcon: this.currentIcon, // (optional) default: 'ic_notification' with fallback for 'ic_launcher'
                // color: EStyleSheet.value('$primaryBlueColor'), // (optional) default: system default
                vibrate: true,
                ongoing: false, // (optional) set whether this is an 'ongoing' notification
                importance: 'max',//
                priority: 'max',
                message: 'Recording is finished', // (required)
                playSound: true
            })
        }
        await this.survey.stopDataCollection(data)
        await this.survey.dataCollection()
        await this.__postAnswers()
        return this.survey.lastAnsweredQuestionId = this.survey.currentSurveyItem.id
    }

    __sendAnswers() {
        this.uploader = DataUploader.getInstance()
        this.uploader.postRespondentAnswers({
            respId: this.survey.respondentId, 
            quesId: this.survey.currentSurveyItem.id.toString(),
        }, this.survey.currentSurveyItem.isLastQuestion)
    }

    async __postAnswers() {
        try {
            console.log('answers start')
            await this.survey.commitData(false, this.__sendAnswers.bind(this))
            console.log('answers end')

        } catch(e) {
            console.log(`error answering ${e}`)
        }
    }

    @observable timeLeft = 0
    
    __startDataCollectingTimer() {
        this.dataCollectionStartTime = Date.now()
        if (this.limitTimeout > 0 && this.questionType !== questionType.ImplicitPrimingTest) {
            const callBack = () => {
                // if (this.questionType === 30)
                //     this.__pushNotification()
                let __timeLeft = this.limitTimeout - (Date.now() - this.dataCollectionStartTime)
                if (__timeLeft < 0) {
                    __timeLeft = 0
                }
                this.timeLeft = __timeLeft
                if (this.timeLeft === 0) {
                    this.finish()
                }
            }
            this.__intervalId = BackgroundTimer.setInterval(() => callBack(), 500)
        }
    }

    __stopDataCollectingTimer() {
        if (!this.responseElapsedMilliseconds) {
            this.responseElapsedMilliseconds = Date.now() - this.dataCollectionStartTime
            if (this.__intervalId) {
                BackgroundTimer.clearInterval(this.__intervalId)
                this.__intervalId = null
            }
        } else {
            Logger.warn('QuestionData timer already stopped')
        }
    }
}

export class VisualInstructionItem extends BaseSurveyItem {
    constructor(survey, trackers) {
        super(survey)
        this.trackers = trackers
    }
    get skippable() {
        return true
    }
}

export class ProjectStopped extends BaseSurveyItem {
    get disableBack() {
        return false
    }
}

export class PermissionsItem extends BaseSurveyItem {
}

export class VideoInstructionItem extends BaseSurveyItem {}

export class AppInstructionItem extends BaseSurveyItem {
    get disableBack() {
        return false
    }
}

export class TextItem extends BaseSurveyItem {
    constructor(survey, text) {
        super(survey)
        this.text = text
    }
}