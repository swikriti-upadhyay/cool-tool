import ScreenRecorder from 'react-native-simple-screen-recorder'
import {Storages} from '../storage/data-storage-helper'
import PathHelper from '../utils/path-helper'
import Logger from '../utils/logger'
import SystemTracker from './system-tracker'

export default class ScreenTracker extends SystemTracker {
    static fileName = 'capture'

    async startDataCollection(respondentId, questionId, screenData) {
        try {
            if (!respondentId || !questionId)
                throw new Error('Respondent id or question id was not specified')

            if (!this.start(respondentId, questionId))
                throw new Error('Already started')

            let settings = await Storages.SettingsStorage.getSettings()
            if (!settings.screenFolder) {
                throw new Error('Screen records folder was not specified')
            }
            let { withAudio } = settings;
            this.folderPath = PathHelper.combine(settings.screenFolder, respondentId, questionId)
            let width = parseInt((Math.ceil(screenData.screen.width * screenData.scale / 2) * 2)),
                height = parseInt((Math.ceil(screenData.screen.height * screenData.scale / 2) * 2))
            
            await ScreenRecorder.start(this.folderPath, ScreenTracker.fileName, width, height, 1)
            Logger.log('started screen recorder')
            this.trackingStartTime = Date.now()
        } catch (e) {
            Logger.error(e)
            throw new Error('Unable to start screen record')
        }
    }

    stopDataCollection() {
        let error = null
        if (!this.stop())
            error = new Error('Already stopped')

        return ScreenRecorder.stop()
            .then((recordFilePath) => {
                if (error)
                    return Promise.reject(error)
                Logger.log('stoped screen recorder')
                this.recordFilePath = recordFilePath
            })
            .catch(e => {
                Logger.error(e)
                return Promise.reject(new Error('Unable to stop screen record'))
            })
    }

    dataCollection() {
        const {recordFilePath, respondentId, questionId, trackingStartTime} = this,
            files = ['capture.mp4']

        return {
            index: files,
            data: {
                recordFilePath,
                respondentId,
                questionId,
                files: files,
                trackingStartTime
            }
        }
    }
}