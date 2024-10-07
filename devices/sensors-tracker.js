import SystemTracker from './system-tracker'
import OrientationService from '../utils/orientation-service'
import OrientationTrackerData from '../data/orientation-tracker-data'
import SensorTrackerData from '../data/sensor-tracker-data'
import Logger from '../utils/logger'
import {
    accelerometer,
    gyroscope,
    setUpdateIntervalForType,
    SensorTypes
  } from 'react-native-sensors'
import { observe } from 'mobx'

export default class SensorsTracker extends SystemTracker {

    gyroscopeEvents = []
    accelerometerEvents = []
    rotationEvents = []

    observerDisposer = null
    accelerometerSubscription = null
    gyroscopeSubscription = null

    initialOrientation = null

    startDataCollection(respondentId, questionData) {
        
        // setUpdateIntervalForType(SensorTypes.accelerometer, 16)
        // setUpdateIntervalForType(SensorTypes.gyroscope, 16)

        this.initialOrientation = OrientationService.instance.currentRotation

        this.observerDisposer = observe(OrientationService.instance, 'currentRotation', (change) => {
            if (this.activated) {
                this.rotationEvents.push(new OrientationTrackerData(change.newValue, this.trackingTimeOffset))
            }
        }, true)

        // this.accelerometerSubscription = accelerometer.subscribe(
        //     ({ x, y, z, timestamp }) => {
        //         if (this.activated) {
        //             timestamp = Number(timestamp)
        //             let timeOffset = timestamp - this.trackingStartTime

        //             this.accelerometerEvents.push(new SensorTrackerData(x, y, z, timeOffset))
        //         }
        //     },
        //     (err) => {
        //         Logger.warn(err)
        //     }
        // )

        // this.gyroscopeSubscription = gyroscope.subscribe(
        //     ({ x, y, z, timestamp }) => {
        //         if (this.activated) {
        //             timestamp = Number(timestamp)
        //             let timeOffset = timestamp - this.trackingStartTime

        //             this.gyroscopeEvents.push(new SensorTrackerData(x, y, z, timeOffset))
        //         }
        //     },
        //     (err) => {
        //         Logger.warn(err)
        //     }
        // )

        if (this.start(respondentId, questionData.id))
            return Promise.resolve()
        else
            return Promise.reject('Already started')
    }

    stopDataCollection() {
        if (this.stop()) {
            this.observerDisposer()
            // this.accelerometerSubscription.unsubscribe()
            // this.gyroscopeSubscription.unsubscribe()
            return Promise.resolve()
        } else
            return Promise.reject('Already stopped')
    }

    dataCollection(referenceDataCollectionStartTime, responseElapsedMilliseconds) {
        let timeCorrection = referenceDataCollectionStartTime - this.trackingStartTime

        let rotations = this.rotationEvents.map(re => {
            re.t = re.t - timeCorrection
            return re
        }).filter(re => re.t >= 0 && re.t <= responseElapsedMilliseconds)

        if (rotations.length === 0 || rotations[0].t !== 0)
            rotations.splice(0, 0, new OrientationTrackerData(this.initialOrientation, 0))

        // let _gyroscopeEvents = this.gyroscopeEvents.map(ge => {
        //     ge.t = ge.t - timeCorrection
        //     return ge
        // }).filter(ge => ge.t >= 0 && ge.t <= responseElapsedMilliseconds)

        // let _accelerometerEvents = this.accelerometerEvents.map(ae => {
        //     ae.t = ae.t - timeCorrection
        //     return ae
        // }).filter(ae => ae.t >= 0 && ae.t <= responseElapsedMilliseconds)

        return {
            rotations: rotations,
            // gyroscope: _gyroscopeEvents,
            // accelerometer: _accelerometerEvents
        }
    }
}