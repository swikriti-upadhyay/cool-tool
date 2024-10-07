import React from 'react'
import {
    View,
    Alert,
    StyleSheet
} from 'react-native'
import Logger from '../../../utils/logger'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyleService from '../../../utils/style-service'
import { validateImage, processData } from '../cameraCallibration/cameraDataContainer'

import BaseRenderer from '../base-renderer'
import Navigation from '../../../utils/navigation-service'
import PermissionsService from '../../../utils/permissions-service';

import InstruictionsView from './InstructionsView'

import Constants from '../../../constants'
import { Storages } from '../../../storage/data-storage-helper';
const videSrc = require('@assets/video/instruction.mp4')

export default class VisualInstructionsRenderer extends BaseRenderer {
    get className() { return 'VisualInstructionsRenderer' }

    state = {
        skipVideo: false
    }

    permissionsService = PermissionsService.instance

    nextAction = this.finish

    async handleFinish() {
        let screenRecordingEnabled = await this.permissionsService.requestScreenRecordPermission()
        if (!screenRecordingEnabled) {
            return Promise.reject(new Error('Please enable screen recording'))
        } else {
            this.nextAction()
        }
    }

    handleClose() {}

    handleVideoEnd() {
        this.setState({
            skipVideo: true
        })
    }

    get canGoNext() {
        return Constants.isDebug || this.state.skipVideo
    }

    render() {
        return <InstruictionsView
                    handleFinish={() => this.handleFinish()}
                    handleClose={() => this.handleClose()}
                    onVideoEnd={() => this.handleVideoEnd()}
                    isGuest={this.surveyItem.survey.isGuest}
                    canGoNext={this.canGoNext}
                    fallbackVideo={videSrc}
                    video={this.surveyItem.survey.videoInstructionUrl}
                    // validating={this.state.validating}
                />
    }
}

const styles = EStyleSheet.create({
    backgroundVideo: {
        ...StyleSheet.absoluteFillObject
      },
})