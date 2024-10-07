import { PermissionsAndroid, Alert } from 'react-native'
import OpenSettings from 'react-native-open-settings';
import SimpleRecorder from 'react-native-simple-screen-recorder'
import Logger from './logger'
import ServiceRunner from '../ServiceExample'
import {action, observable} from 'mobx'

export default class PermissionsService {

    static __instance = null

    static get instance() {
        if (!PermissionsService.__instance)
            PermissionsService.__instance = new PermissionsService()
        return PermissionsService.__instance
    }

    static isPermGranted(granted) {
        switch (granted) {
            case PermissionsAndroid.RESULTS.DENIED:
            case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
                return false
            default:
                return true
        }
    }

    static isNeverAskPerm(status) {
        return status == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    }
    static permsToAsk = []

    @observable isGranted = false
    @observable isNeverAsk = false
    @observable screenRecordingStarted = false
    @observable recordEnabled = false
    permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA
    ]

    @action
    async checkPermissions() {
        let isGranted = true
        for (let i = 0; i < this.permissions.length; i++) {
            let currentPermission = this.permissions[i]
            isGranted = await PermissionsAndroid.check(currentPermission)
        }
        return isGranted
    }

    requestPermissions() {
        let checkPromises = []
        PermissionsService.permsToAsk = []

        for (let i = 0; i < this.permissions.length; i++) {
            let currentPermission = this.permissions[i]
            let checkPromise = PermissionsAndroid.check(currentPermission)
                .then((granted) => {
                    if (!granted) {
                        PermissionsService.permsToAsk.push(currentPermission)
                    }
                })
            checkPromises.push(checkPromise)
        }
        return checkPromises
    }

    @action
    hasAllPermissions() {
        return this.checkPermissions()
    }

    @action
    async requestStartPermissions() {
        try {
            await this.requestOverlayDraw();
            await this.checkOverlayPermission();
            await this.obtainPermissions();
            return Promise.resolve(true)
        } catch(e) {
            return Promise.reject(e)
        }
    }

    restrictPermissions() {
        Alert.alert('Permissions denied', 'Go to Settings > Permissions, then allow all listed permissions.', [
            {
                text: 'Open App Settings',
                onPress: () => this.openAppSettings()
            }
        ])
    }

    @action
    obtainPermissions() {
        let checkPromises = this.requestPermissions()

        return Promise.all(checkPromises)
            .then(() => {
                if (PermissionsService.permsToAsk.length > 0) {
                    return PermissionsAndroid.requestMultiple(PermissionsService.permsToAsk)
                } else {
                    return Promise.resolve()
                }
            })
            .then((granted) => {
                let areAllPermissionsGranted = true
                this.isNeverAsk = false
                if (granted) {
                    for (let prop in granted) {
                        if (PermissionsService.isNeverAskPerm(granted[prop])) {
                            areAllPermissionsGranted = false
                            this.isNeverAsk = true
                            break
                        }
                        if (!PermissionsService.isPermGranted(granted[prop])) {
                            areAllPermissionsGranted = false
                            break
                        }
                    }
                }
                return areAllPermissionsGranted
            })
            .catch(e => {
                Logger.error(e)
                return Promise.reject(new Error('Please grant permissions'))
            })
            .then(isGranted => {
                this.isGranted  = isGranted
                if (this.isNeverAsk) {
                    this.restrictPermissions()
                    return Promise.reject(new Error('Permissions denied'))
                }
                if (!isGranted) return Promise.reject(new Error('Please grant permissions'))
                return Promise.resolve(isGranted)
            })
    }

    @action
    openAppSettings() {
        OpenSettings.openSettings()
    }

    @action
    async requestScreenRecordPermission() {
        try {
            let recorder = await SimpleRecorder.requestRecordPermission()
            this.recordEnabled = true
            return Promise.resolve(true)
        } catch(e) {
            this.recordEnabled = false
            return Promise.resolve(false)
        }
    }

    @action
    async requestOverlayDraw() {
        try {
            await this.checkOverlayPermission();
            return Promise.resolve(true)
        } catch {
            return ServiceRunner.askPerrmission()
        }
    }

    @action 
    async checkOverlayPermission() {
        try {
            let overlay = await ServiceRunner.canOverlay();
            if (!overlay) return Promise.reject(new Error('Please enable display over other apps'))
            return Promise.resolve(overlay)
        } catch {
            return Promise.reject(new Error('Please enable display over other apps'))
        }
    }
}