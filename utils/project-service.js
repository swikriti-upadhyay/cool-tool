import pathHelper from './path-helper'
import {deviceInfo} from './device-info-service'
import CommonHelper from './common-helper'

import {
    Storages, 
    SurveyType
} from '../storage/data-storage-helper'
import {
    action,
    observable,
    transaction
} from 'mobx'
import Logger from './logger'
import Constants from '../constants'
import timeoutFetch from '../utils/timeout-fetch'
import { rootStore } from '../store/RootStore'

export class ProjectInfo {
    constructor(surveyCode) {
        this.surveyCode = surveyCode
        this.id = Date.now()
    }

    @observable surveyCode = null
    @observable isValidated = false //is validation was called
    @observable isValid = false
    @observable projectId = null
    @observable projectName = null
    @observable hasNeuroQuestions = false
    @observable surveyType
    @observable timeout

    @action
    async validateProjectInfo() {
        if (this.surveyCode) {
            let projectInfo = null
            let commandUrl = pathHelper.combine(Constants.serverUrl, `GetProjectInfo?survey=${this.surveyCode}`)
            try {
                let res = await timeoutFetch(fetch(commandUrl, {
                        insecure: true,
                        rejectUnauthorized: false
                    }), 15000)

                projectInfo = await res.json()
                Logger.fetchSuccess(commandUrl, projectInfo)
            } catch (e) {
                this.isValid = false
                Logger.fetchError(commandUrl, e)
                Logger.error('This code is not valid')
                // throw 'This code is not valid'
            }
            transaction(() => {
                if (projectInfo) {
                    this.projectName = projectInfo.projectName
                    this.projectId = projectInfo.projectId
                    this.hasNeuroQuestions = Number(projectInfo.neurolabTrackers) !== 0
                    this.isValid = true
                } else {
                    this.projectName = null
                    this.projectId = null
                    this.hasNeuroQuestions = false
                    this.isValid = false
                }
                this.isValidated = true
            })
        }
        return Promise.resolve(this.isValid)
    }

    getProjectUrl() {
        return pathHelper.combine(Constants.serverUrl, `psrv${this.surveyCode}?mobileapp=1`)
    }
}

class ProjectInfoNew {
    constructor(survey) {
        this.surveyCode = survey?.settings?.surveyCode
        this.projectId = survey?.respondent?.projectId
        this.projectName = survey?.settings?.projectName
        this.id = Date.now()
    }
    @observable surveyCode = null
    @observable isValidated = false //is validation was called
    @observable isValid = true // was false
    @observable projectId = null
    @observable projectName = null
    @observable hasNeuroQuestions = true // false

    @observable surveyType
    @observable timeout
}

export default class ProjectService {

    constructor(survey) {
        this.defaultProject = null
        this.currentProject = null
    }

    static UniversalSurveyCode = 'universal'

    static __instance = null

    static get instance() {
        if (ProjectService.__instance === null)
            ProjectService.__instance = new ProjectService()
        return ProjectService.__instance
    }

    static getProjectCodeFromUrl(surveyUrl) {
        const survPrefix = 'psrv'
        surveyUrl = (surveyUrl && surveyUrl.url) || surveyUrl
        if (!surveyUrl)
            return null
        let surveyCode = pathHelper.getFileName(surveyUrl)
        let paramStart = surveyCode.indexOf('?');
        let lastInd = paramStart !== -1 ? paramStart : surveyCode.length
        if (surveyCode.indexOf(survPrefix) === 0) {
            surveyCode = surveyCode.substring(survPrefix.length, lastInd)
        } else if (surveyCode.indexOf(survPrefix) < 0) {
            return null
        }
        return surveyCode
    }

    static getParamFromUrl(name, url = "") {
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    @action
    async setupProject(survey, surveyType, timeout, isDefaultProject = false) {
        let surveyCode = survey?.settings?.surveyCode
        try {
            if (this.currentProjectInfo?.surveyCode === surveyCode) {
                return this.currentProjectInfo
            }
            this.currentProjectInfo = new ProjectInfoNew(survey)
            this.currentProjectInfo.surveyType = surveyType
            this.currentProjectInfo.timeout = timeout
            this.currentProjectInfo.surveyMeta = survey

            await Storages.ProjectsStorage.setCurrentProject({
                _id: this.currentProjectInfo.surveyCode,
                surveyCode: this.currentProjectInfo.surveyCode,
                projectId: this.currentProjectInfo.projectId,
                projectName: this.currentProjectInfo.projectName,
                metadata: JSON.stringify(this.currentProjectInfo.surveyMeta),
                default: isDefaultProject,
                surveyType: surveyType,
                timeout: timeout
            })
        } catch (e) {
            Logger.error(e)
        }
    }

    @action
    async validateProject(surveyCode, surveyType, timeout) { // setup project info
        let isValid = false;
        try {
            if (!this.currentProjectInfo || this.currentProjectInfo.surveyCode !== surveyCode)
                this.currentProjectInfo = new ProjectInfo(surveyCode)
            this.currentProjectInfo.surveyType = surveyType
            this.currentProjectInfo.timeout = timeout

            isValid = await this.currentProjectInfo.validateProjectInfo()
            if (this.currentProjectInfo.isValid) {
                await Storages.ProjectsStorage.setCurrentProject({
                    _id: this.currentProjectInfo.surveyCode,
                    surveyCode: this.currentProjectInfo.surveyCode,
                    projectId: this.currentProjectInfo.projectId,
                    projectName: this.currentProjectInfo.projectName,
                    surveyType: surveyType,
                    timeout: timeout
                })
            }
        } catch (e) {
            Logger.error(e)
        }
        return Promise.resolve(isValid)
    }


    async __getProjectMetadata(questCode, surveyType = null, timeout = 300) {
        let deviceId = await deviceInfo.getMACAddress()
        try {
            let reqParams = `GetQuestMetadata?survey=${questCode}&data-format=json&autoresult=true&deviceId=${deviceId}`
            if (surveyType != null) { // researcher shit
                let uqt
                // TODO: remove this pease of shit
                if (surveyType === SurveyType.ANON_WEB_TEST) {
                    uqt = 24
                } else if (surveyType === SurveyType.ANON_APP_TEST) {
                    uqt = 30
                } else if (surveyType === SurveyType.ANON_PROT_TEST) {
                    uqt = 31
                }
                reqParams = reqParams + `&uqt=${uqt}&ult=${timeout}`
            }

            let uri = pathHelper.combine(Constants.serverUrl, reqParams)
            let res = await timeoutFetch(fetch(uri, {
                    insecure: true,
                    rejectUnauthorized: false
                }), 15000)
            
            let json = await res.json()
            Logger.fetchSuccess(reqParams)
            return Promise.resolve(json)
        } catch(e) {
            console.log(e)
            throw new Error("This code is not valid")
        }
    }

    async getCurrentProjectMetadata(surveyCode, surveyType = null, timeout = 15) {
        let metadata = await this.__getProjectMetadata(surveyCode, surveyType, timeout)
        if (metadata.respondent) this. setupProject(metadata, surveyType, timeout)
        return metadata
    }

    async getCurrentProjectMetadataNew(surveyCode, surveyType = null, timeout = 15) {
        let metadata = await this.__getProjectMetadata(surveyCode, surveyType, timeout)
        this.setupProject(metadata, surveyType, timeout)
    }

    async getDefaultProjectMetadataNew(surveyCode, surveyType, timeout) {
        let metadata = await this.getCurrentProjectMetadata(surveyCode, surveyType, timeout)
        metadata = this.addRequiredNeuroKey(metadata)
        return this.setupProject(metadata, surveyType, timeout, true)
    }

    async getDefaultProjectMetadata(surveyCode, surveyType, timeout) {
        let metadata = await this.getCurrentProjectMetadata(surveyCode, surveyType, timeout)
        this.setupProject(metadata, surveyType, timeout)
        return this.addRequiredNeuroKey(metadata)
    }

    addRequiredNeuroKey(metadata) { //
        if (!metadata.items) return metadata
        let { settings } = rootStore.settingsStore
        let { surveyType } = this.currentProjectInfo
        let meta = {
            [SurveyType.ANON_APP_TEST]: {
                name: settings.applicationName,
                eyeTrackingWebSiteObjective: settings.applicationTask
            },
            [SurveyType.ANON_WEB_TEST]: {
                name: settings.defaultTestSiteUrl,
                eyeTrackingWebSiteObjective: settings.taskText
            },
            [SurveyType.ANON_PROT_TEST]: {
                name: settings.defaultProtoLink,
                eyeTrackingWebSiteObjective: settings.defaultProtoTask,
                targetDeviceTitle: settings.defaultProtoDevice
            }
        }
        let defaultNeuroQuestion = metadata.items.find((question) => question.questItemType === 0);
            defaultNeuroQuestion.eyeTrackingWebSiteUrl = meta[surveyType].name
            defaultNeuroQuestion.eyeTrackingWebSiteObjective = meta[surveyType].eyeTrackingWebSiteObjective
            defaultNeuroQuestion.targetDeviceTitle = meta[surveyType].targetDeviceTitle

        return metadata
    }

    async unCheckCurrentProject() {
        await Storages.ProjectsStorage.unsetCurrentProject()
    }

    @observable currentProjectInfo = null
}