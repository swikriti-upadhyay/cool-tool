import React from 'react'

import BaseRenderer from '../base-renderer'
import Loader from '../../common/loader-view'
import Orientation from 'react-native-orientation-locker'
import SurveyLayout from '../../layout/SurveyLayout'
import CameraStopRecordView from './CameraStopRecordView'

export default class SurveyRecordingStoppedRenderer extends BaseRenderer {
    get className() { return 'SurveyRecordingStoppedRenderer' }

    start(data) {
        return super.start(data)
              .then(() => {
                Orientation.unlockAllOrientations()
                  return Promise.resolve()
              })
      }

    render() {
        return (
            <SurveyLayout
                footer={<Loader color='#fff' size={40} inline/>}>
                    <CameraStopRecordView
                        isGuest={this.surveyItem.survey.isGuest}
                        isLast={this.surveyItem.survey.isLast}
                        />
            </SurveyLayout>
        )
    }
}