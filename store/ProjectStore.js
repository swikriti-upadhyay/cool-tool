import { observable } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

import { Storages } from '../storage/data-storage-helper'

class ProjectStore {
    @observable projectCode = null;

    constructor(rootStore) {
        this.rootStore = rootStore
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.ProjectsStorage.addListener('inserted', this.insertedHdlr)

        Storages.ProjectsStorage.addListener('updated', this.updatedHdlr)

        Storages.ProjectsStorage.addListener('deleted', this.deletedHdlr)

        this.init()
    }

    init() {
        this.getCurrent()
    }

    inserted(entry) {
        this.projectCode = entry.surveyCode
    }

    updated(entry) {
        this.projectCode = entry.surveyCode
    }

    deleted() {
        this.projectCode = null
    }

    set hasRecording(result) {
        this.hasRecording = result
    }

    get hasRecording() {
        return this.hasRecording
    }

    async getCurrent() {
        let results = await Storages.ProjectsStorage.getCurrentProject()
        this.projectCode = results?.surveyCode
    }
}

export default remotedev(ProjectStore, { global: true })