import CameraRecorder from 'react-native-simple-camera-recorder'
import PathHelper from '../utils/path-helper'
import {Storages} from '../storage/data-storage-helper'
import Logger from '../utils/logger'
import SystemTracker from './system-tracker'

export default class CameraTracker extends SystemTracker {
    static fileName = 'capture'
    static calibrationFileName = 'calibration_capture'

    startDataCollection(respondentId, questionId, screenData, isCalibration = false) {
        if (!respondentId || !questionId)
            return Promise.reject('Respondent id or question id was not specified')

        if (!this.start(respondentId, questionId))
            return Promise.reject('Already started')

        this.isCalibration = isCalibration
        this.screenData = screenData

        return Storages.SettingsStorage.getSettings()
            .then((settings) => {
                if (!settings.cameraFolder) {
                    return Promise.reject('Camera records folder was not specified')
                }
                if (settings.selectedCamera < 0) {
                    return Promise.reject('Camera is not selected')
                }

                if (this.isCalibration) {
                    this.folderPath = PathHelper.combine(settings.cameraFolder, respondentId, 'calibration')
                    this.fileName = CameraTracker.calibrationFileName
                } else {
                    this.folderPath = PathHelper.combine(settings.cameraFolder, respondentId, questionId)
                    this.fileName = CameraTracker.fileName
                }

                return CameraRecorder.start(this.folderPath, this.fileName, settings.selectedCamera)
            })
            .then((startTime) => {
                this.trackingStartTime = Date.now()//Number(startTime)//override base
                Logger.log('Camera record was started')
                return Promise.resolve()
            })
            .catch(e => {
                Logger.error(e)
                return Promise.reject(new Error('Unable to start camera record'))
            })
    }

    stopDataCollection() {
        let error = null
        if (!this.stop())
            error = new Error('Already stopped')
        return CameraRecorder.stop()
            .then((recordFilePath) => {
                if (error)
                    return Promise.reject(error)
                Logger.log('stopped camera recorder')
                this.recordFilePath = recordFilePath
            })
            .catch(e => {
                Logger.error(e)
                return Promise.reject(new Error('Unable to stop camera record'))
            })
    }

    dataCollection(calibrationData) {
        const {recordFilePath, fileName, startTime, respondentId, questionId, screenData, trackingStartTime} = this,
            files = [fileName + '.mp4']

        let result = {
                index: files,
                data: {
                    recordFilePath,
                    startTime,
                    respondentId,
                    questionId,
                    screenData,
                    files: files,
                    trackingStartTime
                }
            }

        if (this.isCalibration) {
            let points = []
            for (let move of calibrationData) {
                let point = [move.startPoint.x * this.screenData.scale, move.startPoint.y * this.screenData.scale]
                points.push([point, move.startedAt - this.trackingStartTime])
                points.push([point, move.movedStatedAt - this.trackingStartTime])

            }
            result.data.calibrationData = points
        }
        return result
    }
}