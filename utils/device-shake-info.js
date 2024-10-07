import {
    gyroscope,
    setUpdateIntervalForType,
    SensorTypes
  } from 'react-native-sensors'
//   import { observable} from 'mobx'
  import Constants from '../constants'
  import Logger from '../utils/logger'

export default class DeviceShakeInfo {
    gyroscopeSubscription = null
    maxDeviation = Constants.shakeDegree || 5 //degree
    gyroscopeData = {}
    isAllowed = true
    isRun = false

    subscribe() {
        setUpdateIntervalForType(SensorTypes.gyroscope, 100);
        this.gyroscopeSubscription = gyroscope.subscribe(({ x, y, z, }) => {
            this.gyroscopeData = {
                x: this.convertToDegree(x),
                y: this.convertToDegree(y),
                z: this.convertToDegree(z)
            }
            this.isRun = true
            this.isAllowedDeviation()
        }, (err) => {
            Logger.warn(err)
        });
    }

    unsubscribe() {
        this.gyroscopeSubscription.unsubscribe()
        this.isRun = false
    }

    isAllowedDeviation() {
        let isAllowed = true
        if(this.gyroscopeData) {
            isAllowed = (this.gyroscopeData.x < this.maxDeviation &&
                 this.gyroscopeData.y < this.maxDeviation && 
                 this.gyroscopeData.z < this.maxDeviation)
        }
        this.isAllowed = isAllowed
    }

    convertToDegree(x) {
        return this.getDeviation(parseInt(Number(x).toFixed(3) * 10 * 2))
    }

    getDeviation(value) {
        return Math.abs(value)
    }
}