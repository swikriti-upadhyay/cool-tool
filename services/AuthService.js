import {facebookAuthProvider}  from "../providers/FacebookServiceProvider";
import {googleAuthProvider} from "../providers/GoogleServiceProvider"
import {emailAuthProvider} from "../providers/EmailServiceProvider"
import BaseAuth from "../providers/BaseAuth"
import UserService from '../utils/auth-service'
import ProjectService from '../utils/project-service'
import {
    Storages,
    UserType
} from '../storage/data-storage-helper'

import {
    observable,
    computed
  } from 'mobx'
import Logger from "../utils/logger";
import firebase from "react-native-firebase";

class Auth extends BaseAuth {
    provider = { //taken from back-end
        facebook: 0,
        google: 1,
        email: 2,
        guest: 3,
        anon: 4
    }

    constructor() {
        super()
        this.userInfo = null
        this.authType = null
        this.isAuthorized = false
        this.getUser()
        this.userService = UserService.instance
        this.projectService = ProjectService.instance
    }

    @observable userInfo = null
    @observable authType = null
    @observable isAuthorized = false

    @computed get getUserName() {
        return this.userInfo ? this.userInfo.name : null
    }

    get userId() {
        return this.userInfo ? this.userInfo.userId : null
    }

    async setUserToDb(user) {
        try {
            currentUserType = await Storages.UserStorage.insertOrUpdate(user)
        } catch(e) {
            Logger.log(e)
        }
    }

    getUser() {
        return new Promise((res: any, rej: any) => {
            Storages.UserStorage.getUser()
            .then(userInfo => {
                this.userInfo = userInfo;
                res(userInfo)
            })
            .catch(e => rej(e))
        })
    }

    async signIn(provider, params, success, error) {
        if (this.isAuthorized && this.authType == this.provider[provider]) {success && success(); return}
        this.userService.isProcessing(true)
        try {
            let userInfo = null
            let code = null
            switch(this.provider[provider]) {
                case this.provider.facebook:
                    userInfo = await facebookAuthProvider.signIn()
                    userInfo.roleId = UserType.USER
                    this.authType = this.provider.facebook
                    code = userInfo.code
                    break
                case this.provider.google:
                    userInfo = await googleAuthProvider.signIn()
                    userInfo.roleId = UserType.USER
                    this.authType = this.provider.google
                    code = userInfo.code
                    break
                case this.provider.guest:
                    userInfo = {
                        id: UserType.GUEST,
                        name: 'Guest',
                        roleId: UserType.GUEST
                    }
                    this.authType = this.provider.guest
                    code = params.code
                    break
                case this.provider.anon:
                    userInfo = {
                        id: UserType.ANON,
                        name: 'anonymous',
                        roleId: UserType.ANON,
                        code: {
                            surveyCode: params.code
                        }
                    }
                    this.authType = this.provider.anon
                    code = params.code
                    success?.()
                    break
                default:
                    const token = await emailAuthProvider.signIn(params)
                    this.getUserInfo().then(userInfo => {
                        this.userInfo = this.userObj(userInfo, token)
                        this.userInfo.roleId = UserType.USER
                        this.authorizeUser(success)
                    })
            }
        } catch(e) {
            this.isAuthorized = false
            this.userInfo = null
            error && error(e)
        }
        this.userService.isProcessing(false)
    }

    async authorizeByToken(token, success) {
        await this.setToken(token)
        this.getUserInfo().then(userInfo => {
            this.userInfo = this.userObj(userInfo, token)
            this.userInfo.roleId = UserType.USER
            this.authorizeUser(success)
        })
    }

    async authorizeUser(done) {
        this.isAuthorized = true
        let code = await this.createOrGetProject(this.userInfo.apiToken)
        this.setUserToDb({...this.userInfo, ...{projectCode: code.surveyCode}})
        let logId = String(this.userInfo.userId)
        firebase.analytics().setUserId(logId)
        done?.(code)
    }

    async signUp(params, success, error) {
        this.userService.isProcessing(true)
        try {
            const token = await emailAuthProvider.register(params)
            this.getUserInfo(token).then(userInfo => {
                this.userInfo = this.userObj(userInfo, token)
                this.userInfo.roleId = UserType.USER
                this.authorizeUser(success)
            })
        } catch(e) {
            Logger.log(e)
            this.isAuthorized = false
            this.userInfo = null
            error && error(e)
        }
        this.userService.isProcessing(false)
    }

    clearData() {
        // this.authType = null
        this.isAuthorized = false
        // this.userInfo = null
    }

    async signOut(onSignedOut) {
        let isSignedOut
        switch(this.authType) {
            case this.provider.google:
            isSignedOut = googleAuthProvider.signOut()
                break
            case this.provider.facebook:
                isSignedOut = facebookAuthProvider.signOut()
                break
            default:
                isSignedOut = emailAuthProvider.signOut()
        }
        isSignedOut.then(()=>{
            this.dropUser().then(() => {
                Logger.log(`Logout`)
                onSignedOut && onSignedOut()
            })
        }).catch((e)=>Logger.log(e))
    }

    dropUser() {
        this.clearData()
        this.userService.deleteUser()
        this.clearToken()
        this.projectService.unCheckCurrentProject()
        Storages.SettingsStorage.clearAccountSettings()
        return Promise.resolve()
    }

    updateSubscription() {
        return new Promise((res, rej) => {
            this.updateCurrentSubscription()
            .then(response => res(response))
            .catch(e => rej(e))
        })
    }

    refresh() {
        // update auth data
    }

    cancelSubscription() {
        this.cancelCurrentSubscription()
    }
}

export const auth = new Auth()