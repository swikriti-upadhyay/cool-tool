import Orientation from 'react-native-orientation-locker'
import BackgroundTimer from 'react-native-background-timer'
import {observable} from 'mobx'
import Logger from './logger'
import NLCommon from 'react-native-nl-common'
import { Camera } from 'expo-camera';

 export default class OrientationService {

    @observable currentRotation = null

    static instance = null

    static init() {
        if (OrientationService.instance === null) {
            OrientationService.instance = new OrientationService()
            OrientationService.instance.currentRotation = Orientation.getInitialOrientation()
            
            let rotationFn = () => { // TODO: find better solution. Maybe orientation listener on main template
                BackgroundTimer.setTimeout(() => {
                    OrientationService.instance.getAngle()
                        .then(angle => {
                            if (OrientationService.instance.currentRotation !== angle) {
                                OrientationService.instance.currentRotation = angle
                                Logger.log('Orientation change ' + OrientationService.instance.currentRotation)
                            }
                        })
                        .then(() => rotationFn())
                        .catch((e) => {
                            Logger.error(e)
                            return Promise.resolve()
                        })
                }, 1000)
            }
            
            OrientationService.instance.getAngle()
                .then((angle) => {
                    OrientationService.instance.currentRotation = angle
                    Logger.log('Initial orientation ' + OrientationService.instance.currentRotation)
                    rotationFn()
                })
        }
    }

    getAngle() {
        return NLCommon.getScreenRotation(Camera.Constants.Type.front)
            .then(angle => {
                return Promise.resolve(angle)
            })
            .catch(e => {
                Logger.error(e)
                return Promise.reject(0)
            })
    }
}