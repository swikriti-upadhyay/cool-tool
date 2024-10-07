import React from 'react'
// import { LoginManager, AccessToken, GraphRequest, GraphRequestManager, LoginButton } from 'react-native-fbsdk'
import BaseAuth from './BaseAuth';
import Logger from '../utils/logger'
class FacebookAuthProvider extends BaseAuth {
    loginResult = [
        'error',
        'isCancelled',
        'grantedPermissions',
        'declinedPermissions'
    ]
    data =  null
    accessToken = null
    permissions = null

    constructor() {
        super()
        // this.requestManager = new GraphRequestManager()
    }

    async grantAccess() {
        try {
            LoginManager.setLoginBehavior('native_with_fallback') //native_with_fallback
            let auth = await LoginManager.logInWithReadPermissions(["public_profile", "email"])
            let token = null
            if (auth.isCancelled) {
                return Promise.reject('Login cancelled')
            } else {
                try {
                    token = await AccessToken.getCurrentAccessToken()
                    this.accessToken = token
                    this.isAuthorized = true
                    return Promise.resolve(this.accessToken)
                } catch(e) {
                    // this.errorMessage(`Can\'t get token - ${e}`)
                }
            }
        } catch(e) {
            this.errorMessage(e)
        }
    }

    async fetchProfile(callback) {
        if (this.data) { // TODO: replace this hack with better solution
            return this.data
        }
        this.data = new Promise((resolve, reject) => {
          const request = new GraphRequest(
            '/me',
            {
                parameters: {
                    fields: {
                        string: 'name, email'
                    }
                }
            },
            (error, result) => {
              if (result) {
                const profile = result
                profile.avatar = `https://graph.facebook.com/${result.id}/picture`
                resolve(profile)
              } else {
                reject(error)
              }
            }
          )
    
          this.requestManager.addRequest(request).start()
        })
        return this.data
    }

    async signIn() {
        let details = {
            grant_type: 'external',
            provider: 'facebook',
            client_id: 'cooltool_custom',
            client_secret: 'cooltool_secret',
            scope: 'api offline_access',
            external_token: null,
        }
        try {
            let tokenInfo = await this.grantAccess()
            details.external_token = tokenInfo.accessToken
            let token = await this.getUserToken(details)
            this.userInfo = await this.getUserInfo(token)
             this.userInfo.code = await this.createOrGetProject(token)
             this.userInfo.accessToken = tokenInfo.accessToken
             Logger.log(details)
            return  this.userInfo
            
        } catch(e) {
            let errorMessage = 'Canceled facebook login'
            Logger.error(errorMessage)
            // throw new Error(errorMessage)
            return Promise.reject(false)
        }
    }

    signOut() {
        try {
            LoginManager.logOut()
            return Promise.resolve(true)
        } catch(e) {
            return Promise.resolve(false)
        }
    }

}
export const facebookAuthProvider = new FacebookAuthProvider()