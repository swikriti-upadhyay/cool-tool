import { observable } from 'mobx';

// import {facebookAuthProvider}  from "../providers/FacebookServiceProvider";
// import {googleAuthProvider} from "../providers/GoogleServiceProvider"
// import {emailAuthProvider} from "../providers/EmailServiceProvider"

import {
    Storages,
    UserType
} from '../storage/data-storage-helper'

export default class UserStore {
    @observable isAuthenticated = false;
    @observable isRespondent = true;
    @observable user = null;
    @observable projectCode = null;
    @observable token = null;

    providers = new Map([
      ]);

    constructor(rootStore) {
        this.rootStore = rootStore
        this.store = Storages.UserStorage
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.UserStorage.addListener('inserted', this.insertedHdlr)

        Storages.UserStorage.addListener('updated', this.updatedHdlr)

        Storages.UserStorage.addListener('deleted', this.deletedHdlr)

        this.init()
    }

    async init() {
        try {
            this.user = await Storages.UserStorage.getUser()
            this.isAuthenticated = this.user.apiToken && !!this.user.apiToken.length
            this.isRespondent = UserType.ANON === this.user.roleId
            this.projectCode = this.user.projectCode
            this.token = this.user.apiToken
        } catch(e) {
            this.user = null
        }
    }

    inserted(entry) {
        this.user = entry
        this.isAuthenticated =  this.user.apiToken && !!this.user.apiToken.length
        this.isRespondent = UserType.ANON === this.user.roleId
        this.projectCode = this.user.projectCode
        this.token = this.user.apiToken
    }

    updated(entry) {
        this.user = entry
        this.isAuthenticated =  this.user.apiToken && !!this.user.apiToken.length
        this.isRespondent = UserType.ANON === this.user.roleId
        this.projectCode = this.user.projectCode
        this.token = this.user.apiToken
    }

    deleted() {
        this.user = null
        this.isAuthenticated = false
        this.isRespondent = true
        this.projectCode = null
        this.token = null
    }

    get isAuthenticated() {
        return this.isAuthenticated = this.user.apiToken && !!this.user.apiToken.length
    }

    get isRespondent() {
        return UserType.ANON === this.user.roleId
    }

    login(provider, params) {
        const payload = {
            provider: provider,
            params
          };
          return this.authenticate(payload);
    }

    async authenticate(payload) {
        let selectedProvider = this.providers.get(payload.provider)
        let user = await selectedProvider.signIn(payload.params)
        asd = await Storages.UserStorage.insertOrUpdate(user)
        console.log(asd)
    }

    get user() {
        return this.store.getById(1)
    }
}