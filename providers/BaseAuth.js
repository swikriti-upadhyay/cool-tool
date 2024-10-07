import Logger from '../utils/logger';
import { Api } from '../utils/Api'
import {Storages, UserType} from '../storage/data-storage-helper'
import Permissions from '../utils/auth-permissions'
import PathHelper from '../utils/path-helper';
import Constants from '../constants';
import { AnalyticsService } from '../utils/analytics-service'
import {
    rootStore
  } from '../store/RootStore'

class UserDTO {
    constructor({User}, token) {
        this.userId = Number(User.Id),
        this.name = User.Name,
        this.email = User.Email,
        this.apiToken = token
    }
}

class subscriptionDTO {
    constructor({Subscription}) {
        this.subscription = {
            subscriptionId: Subscription.Id,
            paid: !Subscription.IsFree,
            name: String(Subscription.Name),
            expiration: Subscription.SubscriptionExpiration,
            maxResponseNumber: Subscription.SubscriptionBasicResponseNumber,
            responseCollected: Subscription.ResponseCollected,
            responseLeft: Subscription.ResponseLeft,
            downgradeRequested: Subscription.DowngradeRequested,
            monthPackageExpiration: Subscription.MonthPackageExpiration,
            extraResponsePrice: Subscription.ExtraResponsePrice
        }
    }
}

export default class BaseAuth extends Permissions {
    constructor() {
        super()
        this.isAuthorized = false
        this.roleId = UserType.USER
        this.analyticsService = AnalyticsService.instance
        this.starterDebug = false
    }

    get starterSubscription() {
        return {
            "Subscription": {
                "Id": 192118232,
                "Name": "Starter",
                "MonthPackageExpiration": -62135596800000,
                "SubscriptionExpiration": -62135596800000,
                "SubscriptionBasicResponseNumber": 0,
                "ResponseCollected": 0,
                "ExtraResponsePrice": 0.0,
                "ActivationDate": -62135596800000,
                "IsFree": true,
                "ResponseLeft": 0,
                "DetailId": 238987206,
                "DowngradeRequested": false
            }
        }
    }

    subscriptionObj(obj) {
        let user = this.starterDebug ? {...obj, ...this.starterSubscription} : obj
        return new subscriptionDTO(user)
    }

    updateSubscriptionEntryForUser(user) {
        let { subscription } = this.subscriptionObj(user)
        let { subscriptionStore, settingsStore } = rootStore
        if (subscriptionStore?.current?.subscriptionId === 192118232) {
            settingsStore.handleUpdate({
                timeout: Constants.DefaultTime
            })
        }
        subscriptionStore.insertOrUpdate(subscription)
    }

    async updateCurrentSubscription() {
        try {
            if (!this.isAuthorized) Promise.resolve(false)
            const userData = await this.getUserInfo()
            this.updateSubscriptionEntryForUser(userData)
            return Promise.resolve(true)
        } catch {
            Logger.log("No subscription available for guest user")
            return Promise.resolve(false)
        }
    }

    async toggleToStarter() {
        this.starterDebug = !this.starterDebug
        this.updateCurrentSubscription()
    }

    cancelCurrentSubscription() {
        Api.get('CancelSubscriptionCommand.cmd')
        .then((res) => {
            this.updateCurrentSubscription()
        })
        .catch(() => {
            return Promise.reject(new Error("Can't cancel"))
        })
    }

    async getUserInfo() {
        try {
            let userInfo = await Api.get('GetUserProfile.cmd')
            this.updateSubscriptionEntryForUser(userInfo.data)
            return Promise.resolve(userInfo.data)
        } catch(e) {
            return Promise.reject(new Error('Wrong credentials'))
        }
    }

    userObj(user, token) {
        return new UserDTO(user, token)
    }

    async logUser(token) {
        await this.analyticsService.connectUserToDevice(token)
    }

    convertObjectToUri(object) {
        let uri = [];
        for (var property in object) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(object[property]);
            uri.push(encodedKey + "=" + encodedValue);
        }
        uri = uri.join("&");
        return uri
    }

    async getUserToken(params) {
        try {
            let formBody = this.convertObjectToUri(params)
            let tokenInfo = await Api.post('identity/connect/token', formBody, {'Content-Type': 'application/x-www-form-urlencoded'})
            return Promise.resolve(tokenInfo.data.access_token)
        } catch {
            return Promise.reject(new Error('Incorrect email or password.'))
        }
    }

    async registerUser(params) {
        try {
            let details = {
                login: params.email.toLowerCase(),
                name: params.name,
                password: params.password,
                job: params.job
            }
    
            let formBody = this.convertObjectToUri(details)
            let tokenInfo = await Api.post('RegisterCommand.cmd', formBody, {'Content-Type': 'application/x-www-form-urlencoded'})
            if (tokenInfo.data.errormessage) return Promise.reject(new Error(tokenInfo.data.errormessage))
            return Promise.resolve(tokenInfo.data.access_token)
        } catch {
            return Promise.reject(new Error('Incorrect email or password.'))
        }
    }

    async resetPassword(email) {
        let details = {
            email: email
        }; 
        try {
            let res = await Api.post('RemindPasswordCommand.cmd', details)
            if (res.data) return Promise.resolve('Password-reset email sent!\nCheck your email please.')
            if (!res.data) return Promise.reject(new Error('The user with this e-mail address doesn\'t exist.'))
        } catch {
            return Promise.reject(new Error('Incorrect email or password.'))
        }
    }

    async changePassword(password, hash) {
        try {
            let details = {
                password: password,
                hash: hash
            };
            let formBody = this.convertObjectToUri(details)
            await Api.post('ChangePassword.cmd', formBody, {
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            return Promise.resolve('Password was changed successfully.')
        } catch {
            return Promise.reject(new Error('Something was wrong'))
        }
    }

    async revokeToken() {
        try {
            let { userStore } = rootStore
            let params = {
                client_id: 'cooltool',
                client_secret: 'cooltool_secret',
                token: userStore?.token
            }
            Api.post('identity/connect/revocation', this.convertObjectToUri(params), {
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        } catch {}
    }

    errorMessage(error) {
        Logger.error(e)
        return Promise.reject(error)
    }

    async createOrGetProject() {
        try {
            let project = await Api.post('api/GetDefaultNLProject.cmd')
            return Promise.resolve(project.data)
        } catch {
            return Promise.reject(new Error("Can't get default project"))
        }
    }

    setToken(token) {
        Api.access_token = token
        return Promise.resolve()
    }

    clearToken() {
        Api.access_token = null
        return Promise.resolve()
    }
}