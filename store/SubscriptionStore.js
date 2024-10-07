import { observable } from 'mobx';
import remotedev from 'mobx-remotedev/lib/dev';

import { Storages } from '../storage/data-storage-helper'

class SubscriptionStore {
    @observable isPaid = false;
    @observable subscription

    constructor(rootStore) {
        this.rootStore = rootStore
        this.store = Storages.SubscriptionStorage
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.SubscriptionStorage.addListener('inserted', this.insertedHdlr)

        Storages.SubscriptionStorage.addListener('updated', this.updatedHdlr)

        Storages.SubscriptionStorage.addListener('deleted', this.deletedHdlr)

        this.init()
    }

    async init() {
        let subscription = await Storages.SubscriptionStorage.getSubscription()
        this.isPaid = subscription?.paid
        this.subscription = subscription
    }

    inserted(entry) {
        this.isPaid = entry.paid
        this.subscription = entry
    }

    updated(entry) {
        this.isPaid = entry.paid
        this.subscription = entry
    }

    deleted() {
        this.isPaid = null
        this.subscription = null
    }

    set hasRecording(result) {
        this.hasRecording = result
    }

    get hasRecording() {
        return this.hasRecording
    }

    get current() {
        return this.subscription
    }

    handleUpdate(payload) {
        this.store.getSubscription().then((subscription) => {
            this.store.update({...subscription, ...payload})
        })
    }

    insertOrUpdate(subscription) {
        this.store.insertOrUpdate(subscription)
    }
}

export default remotedev(SubscriptionStore, { global: true })