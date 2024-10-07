import { observable } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

import { Storages } from '../storage/data-storage-helper'

class SettingsStore {
    @observable settings = {}
    @observable isTermsAgree = false
    @observable neverAskApp = false
    @observable neverAskSite = false
    @observable timeout = 0
    @observable surveyCount = 0
    @observable allowOrientationChange = true
    @observable isAppFilled = false
    @observable isWebFilled = false

    constructor(rootStore) {
        this.rootStore = rootStore
        this.store = Storages.SettingsStorage
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.SettingsStorage.addListener('inserted', this.insertedHdlr)

        Storages.SettingsStorage.addListener('updated', this.updatedHdlr)

        Storages.SettingsStorage.addListener('deleted', this.deletedHdlr)

        this.init()
    }

    async init() {
        try {
            let settings = await Storages.SettingsStorage.getSettings()
            this.isTermsAgree = settings.terms
            this.neverAskApp = settings.neverAskApp
            this.neverAskSite = settings.neverAskSite
            this.timeout = settings.timeout
            this.surveyCount = settings.trialCounter
            this.allowOrientationChange = settings.allowOrientationChange
            this.isAppFilled = (settings.applicationName && settings.applicationTask && settings.timeout)
            this.isWebFilled = (settings.defaultTestSiteUrl && settings.taskText && settings.timeout)
            this.settings = settings
            Storages.SettingsStorage.update(settings)
        } catch(e) {
            this.user = null
        }
    }

    inserted(entry) {
        let settings = entry
        this.isTermsAgree = settings.terms
        this.neverAskApp = settings.neverAskApp
        this.neverAskSite = settings.neverAskSite
        this.timeout = settings.timeout
        this.surveyCount = settings.trialCounter
        this.allowOrientationChange = settings.allowOrientationChange
        this.isAppFilled = (settings.applicationName && settings.applicationTask && settings.timeout)
        this.isWebFilled = (settings.defaultTestSiteUrl && settings.taskText && settings.timeout)
        this.settings = settings
    }

    updated(entry) {
        let settings = entry
        this.isTermsAgree = settings.terms
        this.neverAskApp = settings.neverAskApp
        this.neverAskSite = settings.neverAskSite
        this.timeout = settings.timeout
        this.surveyCount = settings.trialCounter
        this.allowOrientationChange = settings.allowOrientationChange
        this.isAppFilled = (settings.applicationName && settings.applicationTask && settings.timeout)
        this.isWebFilled = (settings.defaultTestSiteUrl && settings.taskText && settings.timeout)
        this.settings = settings
    }

    deleted() {
        this.settings = {}
        this.isTermsAgree = false
        this.neverAskApp = false
        this.neverAskSite = false
        this.timeout = 0
        this.surveyCount = 0
        this.allowOrientationChange = true
        this.isAppFilled = false
        this.isWebFilled = false
    }

    handleUpdate(payload) {
        this.store.getSettings().then((settings) => {
            this.store.update({...settings, ...payload})
        })
    }
}

export default remotedev(SettingsStore, { global: true })