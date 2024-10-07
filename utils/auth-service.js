import {action, observable} from 'mobx'
import {Storages, UserType} from '../storage/data-storage-helper'

// import Permissions from './auth-permissions'
import Constants from '../constants'

export const userArr = [
    'anon',
    'guest',
    'user',
    'admin'
]
export default class AuthService {
    @observable user = {}
    @observable type = null
    @observable isAuthorized = false
    @observable roleId = null
    @observable processing = false
    constructor() {
        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.deletedHdlr = (entry) => this.deleted(entry)

        Storages.UserStorage.addListener('inserted', this.insertedHdlr)

        Storages.UserStorage.addListener('updated', this.updatedHdlr)

        Storages.UserStorage.addListener('deleted', this.deletedHdlr)
    }
    inserted(entry) {
        let user = entry
        AuthService.__instance.user = user
        AuthService.__instance.roleId = user.roleId
        AuthService.__instance.isAuthorized = user.apiToken
        AuthService.__instance.type = user ? userArr[user.roleId]: null
    }
    updated(entry) {
        let user = entry
        AuthService.__instance.user = user
        AuthService.__instance.roleId = user.roleId
        AuthService.__instance.isAuthorized = user.apiToken
        AuthService.__instance.type = user ? userArr[user.roleId]: null
    }
    deleted() {
        AuthService.__instance.user = {}
        AuthService.__instance.isAuthorized = false
        AuthService.__instance.type = null
        AuthService.__instance.roleId = 1
        AuthService.__instance.type = null
    }

    async cleanApiKey() {
        await Storages.UserStorage.cleanApiKey()
    }

    async deleteUser() {
        const user = await Storages.UserStorage.getUser()
        await Storages.UserStorage.deleteItem(user?.id)
    }
    
    @action
    async change(type) {
        AuthService.__instance.type = type ? type: null
    }

    @action
    setUser(type) {
        AuthService.__instance.type = type
    }

    @action
    isProcessing(bool) {
        AuthService.__instance.processing = bool
    }

    userType = UserType

    // @action
    is(userType) {
        return AuthService.__instance.type === userType
    }

    get isUserAuthorized() {
        return !!AuthService.__instance.isAuthorized && !!AuthService.__instance.isAuthorized.length
    }

    get hasAccount() {
        return AuthService.__instance.roleId === UserType.USER
    }

    get isGuest() {
        return UserType.GUEST === AuthService.__instance.roleId
    }

    get isRespondent() {
        return UserType.ANON === AuthService.__instance.roleId
    }

    static __instance = null

    static get instance() {
        if (AuthService.__instance === null)
            AuthService.__instance = new AuthService()
        return AuthService.__instance
    }

    static async init() {
        if (AuthService.__instance == null) {
            AuthService.__instance = new AuthService()
        }
        try {
            let user = await Storages.UserStorage.getUser()
            if (!user) return
            AuthService.__instance.user = user
            AuthService.__instance.roleId = user.roleId
            AuthService.__instance.isAuthorized =  user.apiToken // TODO: replace with token
            AuthService.__instance.type = user ? userArr[user.roleId]: null
            AuthService.__instance.hasUser = user ? 'auth': null
        } catch(e) {

        }
    }
}