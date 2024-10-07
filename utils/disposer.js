import ScreenRecorder from 'react-native-simple-screen-recorder'
import CameraRecorder from 'react-native-simple-camera-recorder'

import Logger from './logger'

export default class Disposer {
    static disposeTrackers() {
        Promise.all([
            ScreenRecorder.stop(),
            CameraRecorder.stop()
        ])
            .catch(e => {
                Logger.error(e)
            })
    }
}