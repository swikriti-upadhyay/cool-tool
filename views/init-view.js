import React, {Component} from 'react'
import {
    View,
    Linking,
    ToastAndroid
} from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import SplashScreen from 'react-native-splash-screen'

import {mainStyles, colors} from '../styles'
import OrientationService from '../utils/orientation-service'
import ProjectService from '../utils/project-service'
import { StyleService } from '../utils/style-service'
import {Storages} from '../storage/data-storage-helper'
import Logger from '../utils/logger'
import {observer} from 'mobx-react'
import Loader from './common/loader-view'
import Constants from '../constants'
import PermissionsService from '../utils/permissions-service'
import {observe, observable} from 'mobx'
import NavigationService from '../utils/navigation-service'
import UserService from '../utils/auth-service'
import PrimaryButton from './components/primary-btn-component'
import Text from './components/text-component'
import DataUploader from '../sync/data-uploader'
import AppInfo from '../package.json'
import DeviceInfo from 'react-native-device-info'
import PathHelper from '../utils/path-helper';
import CommonHelper from '../utils/common-helper'
import { AnalyticsService } from '../utils/analytics-service'
import { Api } from '../utils/Api'
import { auth } from '../services/AuthService'
import Survey, { SurveyState } from '../datacollection/survey'
import i18n from '../utils/i18n';

@observer
export default class Init extends Component {

    constructor(props) {
        super(props)

        this.userService = UserService.instance

        const tryToNavigate = () => {
              if (this._isInited) {
                if (this.userService.isUserAuthorized) {
                    auth.dropUser()
                }
                // else if(this.userService.hasAccount) {
                //     NavigationService.resetAction('Login')
                // } else {
                // }
                this.navigateMainScreen()
            }
        }

        observe(this, tryToNavigate)
    }

    @observable _isInited = false

    componentWillMount() {
        this.urlHandler = (urlData) => {
            if (Survey.getCurrent()?.surveyStatus === SurveyState.Running) {
                return ToastAndroid.show(i18n.t('please_finish'), ToastAndroid.SHORT)
            }
            let { url } = urlData
            this.surveyCode = ProjectService.getProjectCodeFromUrl(url)
            let respondent = ProjectService.getParamFromUrl('resp', url)
            this.userOpenedApplication(respondent)
            if (this.surveyCode) this.navigateMainScreen()
        }

        Linking.addEventListener('url', this.urlHandler)
        try {
            this.init()
        } catch {}
    }

    componentWillUnmount() {
        // this._isInited = false;
        // Linking.removeEventListener('url', this.urlHandler)
    }

    navigateMainScreen() {
        NavigationService.resetAction('Enter', {surveyCode: this.surveyCode})
    }

    userOpenedApplication(respID) {
        if (respID === null) return
        Api.post('UserOpenedApplication.cmd', {
            ProjectContactId: respID
        })
    }

    async checkVersion() {
        try {
            let version = await Api.get('GetApplicationVersionCommand.cmd')
            return version.data.res
        } catch {
            Logger.log('Error while check app version')
        }
    }

    async addDemoVideoByID(respondentId) {
        try {
            let demo = await Api.get(`UniversalNLProjectCommand.cmd?command=getrespondentvideos&respondents=${respondentId}`)
            const res = demo.data.res
            let respondent = CommonHelper.demoVideo(respondentId, res[0].questions[0].qid, res[0].questions[0].url)
            respondentStorage.insert(respondent)
        } catch {
            Logger.log("Can't load demo video")
        }
    }

    async init() {
        try {
            let settingsStorage = Storages.SettingsStorage
            let settings = await settingsStorage.getSettings()
            let appVersion = Number(DeviceInfo.getBuildNumber())
            this.checkVersion().then((currentAppVersion) => {
                if (Number(currentAppVersion) > appVersion) {
                    NavigationService.resetAction('UpdateApp')
                }
            })
            if (!settings) {
                // this.addDemoVideoByID(Constants.demoVideoId)
                const dirs = RNFetchBlob.fs.dirs,
                    dataFolder = dirs.SDCardApplicationDir + '/respData',
                    screenFolder = dataFolder + '/screen',
                    cameraFolder = dataFolder + '/camera';

                settings = {
                    dataFolder: dataFolder,
                    cameraFolder: cameraFolder,
                    screenFolder: screenFolder,
                    selectedCamera: -1,
                    serverUrl: Constants.defaultServer,
                    shakeDegree: Constants.shakeDegree,
                    defaultTestSiteUrl: '',
                    taskText: '',
                    advancedFaceValidation: true,
                    builtinFaceDetection: true,
                    isDebug: false,
                    isDeviceRegistered: false
                }
                await settingsStorage.insert(settings)
            }
            await Promise.all([
                OrientationService.init(),
                UserService.init(),
                StyleService.initialize()
            ]).then(() => {
                // Run after main settings init
                AnalyticsService.init()
            })
            let initialUrl = await Linking.getInitialURL()
            this.surveyCode = ProjectService.getProjectCodeFromUrl(initialUrl)
            let respondent = ProjectService.getParamFromUrl('resp', initialUrl)
            this.userOpenedApplication(respondent)
        } catch (e) {
            Logger.error(e)
        } finally {
            this._isInited = true
            SplashScreen.hide();
        }
    }


    render() {
        return <Loader/>
    }
}