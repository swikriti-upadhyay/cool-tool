import React from 'react'
import Orientation from 'react-native-orientation-locker'
import {Storages} from '../../storage/data-storage-helper'
import BaseRenderer from './base-renderer'
import EyeTrackerCalibration from '../calibration/calibration1/scene'
import Loader from '../common/loader-view'

export default class EyeTrackerCalibrationRenderer extends BaseRenderer {
    get className() { return 'EyeTrackerCalibrationRenderer' }

    start() {
        return super.start()
            .then(() => {
                this.calEntity.start()
            })
            .catch((e)=>console.log(e))
    }

    render() {
        return <EyeTrackerCalibration 
                    ref={calEntity => this.calEntity = calEntity}
                    onCalibrationFinished={(data) => this.finish(data.moves)}
                    layout={this.props.layout}
                    t={this.props.t}
                />
    }
}