import { observable } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

import { Storages } from '../storage/data-storage-helper'

class RespondentStore {
    @observable hasRecording = false;

    constructor(rootStore) {
        this.rootStore = rootStore
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.RespondentStorage.addListener('inserted', this.insertedHdlr)

        Storages.RespondentStorage.addListener('updated', this.updatedHdlr)

        Storages.RespondentStorage.addListener('deleted', this.deletedHdlr)

        this.init()
    }

    init() {
        this.fetchRespondents()
    }

    inserted(entry) {
        if (entry.surveyCode === 'universal')
            this.hasRecording = true
    }

    updated(entry) {
    }

    deleted() {
        this.hasRecording = false
    }

    set hasRecording(result) {
        this.hasRecording = result
    }

    get hasRecording() {
        return this.hasRecording
    }

    async fetchRespondents() {
        await Storages.RespondentStorage.getUniversal()
        .then((results) => {
            this.hasRecording = results.length > 0
        })
    }
}

export default remotedev(RespondentStore, { global: true })