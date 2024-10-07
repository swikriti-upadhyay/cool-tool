import BaseAuth from './BaseAuth'

class EmailAuthProvider extends BaseAuth {
    userInfo = {
        user: {
            name: 'Test User',
            email: 'test@email',
        },
        accessToken: 'temp'
    }

    async signIn(params) {
        let details = {
            username: params.email.toLowerCase(),
            password: params.password,
            grant_type:'password',
            client_id:'cooltool',
            client_secret:'cooltool_secret',
            scope:'api'
        }
        try {
            let token = await this.getUserToken(details)
            return Promise.resolve(token)
        } catch(e) {
            return Promise.reject(e)
        }
    }
    async register(params) {
        try {
            let token = await this.registerUser(params)
            return Promise.resolve(token)
        } catch(e) {
            return Promise.reject(e)
        }
    }
    signOut() {
        return this.revokeToken()
    }
    
    async isSignedIn() {

    }
}

export const emailAuthProvider = new EmailAuthProvider